#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.join(__dirname, '../docs/screenshots');

async function captureAfterMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5174/');
  await page.getByLabel('Email').fill(`mobile-${Date.now()}@example.com`);
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.getByLabel('Title').fill('Mobile ready');
  await page.getByLabel('Notes').fill('Responsive layout verified.');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.screenshot({ path: path.join(shotsDir, 'after-mobile.png'), fullPage: true });
}

async function captureBeforeMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/');
  await page.screenshot({ path: path.join(shotsDir, 'before-mobile.png'), fullPage: true });
}

async function captureReport(page) {
  const reportHtml = fs.readFileSync(path.join(__dirname, '../docs/report-preview.html'), 'utf8');
  await page.setViewportSize({ width: 1100, height: 1400 });
  await page.setContent(reportHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(shotsDir, 'report-preview.png'), fullPage: true });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await captureBeforeMobile(page);
  await captureAfterMobile(page);
  await captureReport(page);
  await browser.close();
}

main();
