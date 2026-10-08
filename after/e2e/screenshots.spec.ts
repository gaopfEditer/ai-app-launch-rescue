import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.join(__dirname, '../../docs/screenshots');

test('capture after app screenshots', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: path.join(shotsDir, 'after-auth.png'), fullPage: true });

  const email = `screenshot-${Date.now()}@example.com`;
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByRole('heading', { name: 'Your notes' })).toBeVisible();
  await page.screenshot({ path: path.join(shotsDir, 'after-dashboard-empty.png'), fullPage: true });

  await page.getByLabel('Title').fill('Launch checklist');
  await page.getByLabel('Notes').fill('Move API keys server-side and add auth.');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByRole('button', { name: 'AI summarize' }).click();
  await expect(page.getByText(/mock summary/i)).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: path.join(shotsDir, 'after-dashboard-summary.png'), fullPage: true });
});
