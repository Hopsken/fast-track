import path from 'node:path'

import { defineConfig } from '@playwright/test'

const extensionPath = path.resolve(__dirname, '.output/chromium-mv3')

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup',
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  // Run tests serially to avoid browser context conflicts
  workers: 1,
  use: {
    headless: true,
    // viewport: { width: 1280, height: 720 },
    // Add trace on first retry for debugging
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'popup',
      testDir: './tests/e2e/popup'
    },
    {
      name: 'options',
      testDir: './tests/e2e/options'
    }
  ],
  metadata: {
    extensionPath
  }
})
