#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.join(__dirname, '../docs/screenshots');

const base = process.env.BEFORE_URL || 'http://127.0.0.1:5173';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(base);
  await page.screenshot({ path: path.join(shotsDir, 'before-home.png'), fullPage: true });

  await page.getByPlaceholder('Title').fill('<b>Demo</b> note');
  await page.getByPlaceholder('Notes').fill('<img src=x onerror=alert(1)> XSS demo content');
  await page.getByRole('button', { name: '+' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'before-note-xss.png'), fullPage: true });

  await page.getByRole('button', { name: /AI Summarize/i }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(shotsDir, 'before-ai-summary.png'), fullPage: true });

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
