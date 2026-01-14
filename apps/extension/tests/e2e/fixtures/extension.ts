import path from 'node:path'

import { test as base, BrowserContext, chromium, Page } from '@playwright/test'

const extensionPath = path.resolve(__dirname, '../../../.output/chromium-mv3')

export interface ExtensionFixture {
  context: BrowserContext
  extensionId: string
  openExtensionPage: (pagePath: string) => Promise<Page>
}

/**
 * Playwright fixture that provides an isolated browser context with
 * the extension loaded. Each test gets its own context which is
 * automatically closed after the test completes.
 */
export const test = base.extend<ExtensionFixture>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    })

    await use(context)
    await context.close()
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
  }
})

export { expect } from '@playwright/test'
