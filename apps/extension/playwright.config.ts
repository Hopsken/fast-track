import { defineConfig } from '@playwright/test'
import path from 'node:path'

const extensionPath = path.resolve(__dirname, '.output/chromium-mv3')

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 }
  },
  metadata: {
    extensionPath
  }
})
