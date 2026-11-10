import { defineConfig } from '@playwright/test';

const port = process.env.PORTFOLIO_TEST_PORT || '4174';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: 'list',
  outputDir: './test-results',
  globalSetup: './tests/setup.mjs',
  use: {
    browserName: 'chromium',
    baseURL,
    locale: 'en-US',
    viewport: { width: 1440, height: 1100 },
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
