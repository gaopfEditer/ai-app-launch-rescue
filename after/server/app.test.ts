import { describe, expect, it, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { createApp } from './app.js';
import { createDb } from './db.js';

describe('createApp', () => {
  let db: Database.Database;

  afterEach(() => {
    db?.close();
  });

  it('trusts one proxy hop so rate limiting uses X-Forwarded-For on Vercel', () => {
    db = createDb(':memory:');
    const app = createApp(db);
    expect(app.get('trust proxy')).toBe(1);
  });
});
