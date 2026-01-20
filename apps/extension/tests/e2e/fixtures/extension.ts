import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { test as base, BrowserContext, chromium, Page } from '@playwright/test'

const extensionPath = path.resolve(__dirname, '../../../.output/chromium-mv3')

/**
 * Mock AuthCredentials for testing authenticated popup views.
 * Uses API key auth since it's simpler and doesn't require token refresh.
 */
const MOCK_AUTH_CREDENTIALS = {
  type: 'apiKey' as const,
  host: 'https://test.atlassian.net',
  userInfo: {
    accountId: 'test-account-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  oauth: null,
  apiKey: {
    email: 'test@example.com',
    apiKey: 'test-api-key'
  }
}

export interface ExtensionFixture {
  context: BrowserContext
  extensionId: string
  openExtensionPage: (pagePath: string) => Promise<Page>
  openAuthenticatedPopup: () => Promise<Page>
}

/**
 * Playwright fixture that provides an isolated browser context with
 * the extension loaded. Each test gets its own context which is
 * automatically closed after the test completes.
 */
export const test = base.extend<ExtensionFixture>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const userDataDir = await mkdtemp(
      path.join(os.tmpdir(), 'jira-boost-e2e-')
    )

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    })

    try {
      await use(context)
    } finally {
      await context.close()
      await rm(userDataDir, { recursive: true, force: true })
    }
  },

  extensionId: async ({ context }, use) => {
    // Wait for the service worker to be available
    const serviceWorker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    const extensionId = new URL(serviceWorker.url()).host
    await use(extensionId)
  },

  openExtensionPage: async ({ context, extensionId }, use) => {
    const openPage = async (pagePath: string): Promise<Page> => {
      const page = await context.newPage()
      await page.goto(`chrome-extension://${extensionId}/${pagePath}`)
      await page.waitForLoadState('domcontentloaded')
      return page
    }

    await use(openPage)
  },

  openAuthenticatedPopup: async ({ context, extensionId }, use) => {
    const openPopup = async (): Promise<Page> => {
      // First, open any extension page to set storage before popup loads
      const setupPage = await context.newPage()
      await setupPage.goto(`chrome-extension://${extensionId}/options.html`)
      await setupPage.waitForLoadState('domcontentloaded')

      // Set auth credentials in storage
      await setupPage.evaluate((credentials) => {
        return chrome.storage.local.set({ AuthCredentials: credentials })
      }, MOCK_AUTH_CREDENTIALS)

      // Close setup page
      await setupPage.close()

      // Now open the popup - it will read the auth credentials on initial load
      const popup = await context.newPage()
      await popup.goto(`chrome-extension://${extensionId}/popup.html`)
      await popup.waitForLoadState('domcontentloaded')

      return popup
    }

    await use(openPopup)
  }
})

export { expect } from '@playwright/test'
