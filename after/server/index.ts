import { createDb } from './db.js';
import { createApp } from './app.js';

const dbPath = process.env.VERCEL ? ':memory:' : process.env.DATABASE_PATH;
const db = createDb(dbPath);
const app = createApp(db);

const PORT = Number(process.env.PORT) || 3002;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`After API listening on http://localhost:${PORT}`);
  });
}

export default app;
