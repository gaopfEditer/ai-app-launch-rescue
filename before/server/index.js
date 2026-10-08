import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'noteflow.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

app.get('/api/notes', (req, res) => {
  const rows = db.prepare('SELECT * FROM notes ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/notes', (req, res) => {
  const { title, body } = req.body;
  const info = db.prepare('INSERT INTO notes (title, body) VALUES (?, ?)').run(title, body);
  res.json({ id: info.lastInsertRowid, title, body });
});

app.delete('/api/notes/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// AI proxy — no auth, no rate limit; client may also call OpenAI directly
function mockSummarize(text) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  return `[Offline mock summary] ${words.length} words. Preview: ${words.slice(0, 10).join(' ') || 'empty'}.`;
}

app.post('/api/ai/summarize', async (req, res) => {
  const { text, apiKey } = req.body;
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!text) {
    res.status(400).json({ error: 'missing text', stack: new Error().stack });
    return;
  }
  if (!key || key === 'mock' || String(key).includes('demo-not-real')) {
    res.json({ summary: mockSummarize(text) });
    return;
  }
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Summarize in 2 sentences.' },
        { role: 'user', content: text },
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Before API on ${PORT}`));
}

export default app;
