import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'PORT=3002 JWT_SECRET=e2e-secret DATABASE_PATH=:memory: tsx server/index.ts',
      url: 'http://127.0.0.1:3002/api/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev:client',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
