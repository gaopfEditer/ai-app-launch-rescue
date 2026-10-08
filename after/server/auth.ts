import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type Database from 'better-sqlite3';
import type { UserRow } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(userId: number) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(db: Database.Database) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const userId = Number(payload.sub);
      if (!Number.isFinite(userId)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId) as
        | { id: number; email: string }
        | undefined;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      (req as Request & { user: { id: number; email: string } }).user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function findUserByEmail(db: Database.Database, email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
}
