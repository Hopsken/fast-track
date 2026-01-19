/**
 * Browser tab management utilities
 */

import { browser } from '#imports'

import { getLogger } from '~/utils/logger'

const log = getLogger('tabs')

/**
 * Opens a URL in a new tab
 */
export async function openInNewTab(
  url: string
): Promise<chrome.tabs.Tab | null> {
  try {
    return await browser.tabs.create({ url })
  } catch (error) {
    log.error('Failed to open new tab:', error)
    return null
  }
}

/**
 * Opens the extension's options page
 */
export function openOptionsPage(): void {
  try {
    browser.runtime.openOptionsPage()
  } catch {
    // Edge compatibility issue workaround
    const manifest = browser.runtime.getManifest()
    const optionsPage = manifest.options_page || '/options.html'
    const optionsPageUrl = browser.runtime.getURL(
      optionsPage as '/options.html'
    )
    browser.tabs.create({ url: optionsPageUrl })
  }
}
