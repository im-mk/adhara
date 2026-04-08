import * as path from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.e2e');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8090';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      testMatch: /tests\/smoke\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'journeys',
      testMatch: /tests\/journeys\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: './tests/setup/global.setup.ts',
});
