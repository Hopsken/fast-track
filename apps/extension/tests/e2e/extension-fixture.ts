import path from 'node:path'
import { chromium, BrowserContext, Page } from '@playwright/test'

const extensionPath = path.resolve(__dirname, '../../.output/chromium-mv3')

export async function launchExtensionContext() {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })

  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
  const extensionId = new URL(serviceWorker.url()).host

  return {
    context,
    extensionId,
    async openExtensionPage(pagePath: string): Promise<Page> {
      const page = await context.newPage()
      await page.goto(`chrome-extension://${extensionId}/${pagePath}`)
      await page.waitForLoadState('domcontentloaded')
      return page
    }
  }
}

export async function closeContext(context: BrowserContext) {
  await context.close()
}
