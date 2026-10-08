import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const defaultPath = path.join(process.cwd(), 'data', 'noteflow.db');

export function createDb(dbPath = process.env.DATABASE_PATH || defaultPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
  `);
  return db;
}

export type UserRow = { id: number; email: string; password_hash: string };
export type NoteRow = { id: number; user_id: number; title: string; body: string; created_at: string };
