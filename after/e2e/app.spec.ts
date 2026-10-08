import { test, expect } from '@playwright/test';

test('register, create note, summarize offline', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(`demo-${Date.now()}@example.com`);
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.getByRole('heading', { name: 'Your notes' })).toBeVisible();

  await page.getByLabel('Title').fill('Client kickoff');
  await page.getByLabel('Notes').fill('Discuss timeline, auth, and deployment.');
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.getByText('Client kickoff')).toBeVisible();

  await page.getByRole('button', { name: 'AI summarize' }).click();
  await expect(page.getByRole('status')).toContainText(/Offline mock summary/i, { timeout: 15_000 });
});
