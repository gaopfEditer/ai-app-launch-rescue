import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type Database from 'better-sqlite3';
import { authMiddleware, findUserByEmail, hashPassword, signToken, verifyPassword } from './auth.js';
import { summarizeText } from './ai.js';
import { loginSchema, noteSchema, registerSchema, summarizeSchema } from './validation.js';

export function createApp(db: Database.Database) {
  const app = express();
  // Vercel (and other reverse proxies) set X-Forwarded-For; trust one hop so req.ip and rate limits are per client.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(',') ?? ['http://localhost:5174'],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, ai: process.env.OPENAI_API_KEY ? 'live-or-fallback' : 'mock' });
  });

  app.post('/api/auth/register', (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;
    if (findUserByEmail(db, email)) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const hash = hashPassword(password);
    const info = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash);
    const token = signToken(Number(info.lastInsertRowid));
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.status(201).json({ id: info.lastInsertRowid, email });
  });

  app.post('/api/auth/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
    const user = findUserByEmail(db, parsed.data.email);
    if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken(user.id);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ id: user.id, email: user.email });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
  });

  const requireAuth = authMiddleware(db);

  app.get('/api/notes', requireAuth, (req, res) => {
    const user = (req as express.Request & { user: { id: number } }).user;
    const rows = db
      .prepare('SELECT id, title, body, created_at FROM notes WHERE user_id = ? ORDER BY id DESC')
      .all(user.id);
    res.json(rows);
  });

  app.post('/api/notes', requireAuth, (req, res) => {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const user = (req as express.Request & { user: { id: number } }).user;
    const { title, body } = parsed.data;
    const info = db
      .prepare('INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)')
      .run(user.id, title, body);
    res.status(201).json({ id: info.lastInsertRowid, title, body });
  });

  app.delete('/api/notes/:id', requireAuth, (req, res) => {
    const user = (req as express.Request & { user: { id: number } }).user;
    const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, user.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  const aiLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests, try again later' },
  });

  app.post('/api/ai/summarize', aiLimiter, requireAuth, async (req, res) => {
    const parsed = summarizeSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
    const user = (req as express.Request & { user: { id: number } }).user;
    let text: string;
    if (parsed.data.noteIds?.length) {
      const placeholders = parsed.data.noteIds.map(() => '?').join(',');
      const rows = db
        .prepare(`SELECT body FROM notes WHERE user_id = ? AND id IN (${placeholders})`)
        .all(user.id, ...parsed.data.noteIds) as { body: string }[];
      text = rows.map((r) => r.body).join('\n');
    } else {
      const rows = db
        .prepare('SELECT body FROM notes WHERE user_id = ? ORDER BY id DESC LIMIT 20')
        .all(user.id) as { body: string }[];
      text = rows.map((r) => r.body).join('\n');
    }
    try {
      const summary = await summarizeText(text || 'No notes yet.');
      res.json({ summary, mode: process.env.OPENAI_API_KEY ? 'api-or-fallback' : 'mock' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Summarization failed' });
    }
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
