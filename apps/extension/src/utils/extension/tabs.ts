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

const normalizePath = (path: string): string => {
  if (path.startsWith('#')) return path.slice(1)
  if (path.startsWith('/')) return path
  return `/${path}`
}

/**
 * Opens the extension's options page.
 *
 * If `path` is provided, we open the options page URL directly with a hash route
 * (Options uses HashRouter), e.g. `/options.html#/workflow/templates/new`.
 */
export function openOptionsPage(path?: string): void {
  // When navigating to a specific hash route, open the URL directly.
  if (path) {
    const manifest = browser.runtime.getManifest()
    const optionsPage = manifest.options_page || '/options.html'
    const optionsPageUrl = browser.runtime.getURL(
      optionsPage as '/options.html'
    )

    const normalized = normalizePath(path)

    browser.tabs.create({ url: `${optionsPageUrl}#${normalized}` })
    return
  }

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
