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
 * Opens a URL in the current tab
 */
export async function openInCurrentTab(url: string): Promise<boolean> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]

    if (currentTab?.id) {
      await browser.tabs.update(currentTab.id, { url })
      return true
    }
    return false
  } catch (error) {
    log.error('Failed to open in current tab:', error)
    return false
  }
}

/**
 * Closes the current tab (useful for popup cleanup)
 */
export function closeCurrentWindow(): void {
  if (window) {
    window.close()
  }
}

/**
 * Gets all tabs matching a pattern
 */
export async function getMatchingTabs(
  pattern: string
): Promise<chrome.tabs.Tab[]> {
  try {
    return await browser.tabs.query({ url: pattern })
  } catch (error) {
    log.error('Failed to get matching tabs:', error)
    return []
  }
}

/**
 * Gets all Jira tabs
 */
export async function getJiraTabs(): Promise<chrome.tabs.Tab[]> {
  return getMatchingTabs('https://*.atlassian.net/jira*')
}

/**
 * Focuses/activates a specific tab
 */
export async function focusTab(tabId: number): Promise<boolean> {
  try {
    await browser.tabs.update(tabId, { active: true })

    // Also focus the window containing the tab
    const tab = await browser.tabs.get(tabId)
    if (tab.windowId) {
      await browser.windows.update(tab.windowId, { focused: true })
    }

    return true
  } catch (error) {
    log.error('Failed to focus tab:', error)
    return false
  }
}

/**
 * Reloads a specific tab
 */
export async function reloadTab(tabId: number): Promise<boolean> {
  try {
    await browser.tabs.reload(tabId)
    return true
  } catch (error) {
    log.error('Failed to reload tab:', error)
    return false
  }
}

/**
 * Gets tab information
 */
export async function getTabInfo(
  tabId: number
): Promise<chrome.tabs.Tab | null> {
  try {
    return await browser.tabs.get(tabId)
  } catch (error) {
    log.error('Failed to get tab info:', error)
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

/**
 * Utility for opening Jira issues
 */
export async function openJiraIssue(
  issueKey: string,
  baseUrl?: string
): Promise<boolean> {
  if (!baseUrl) {
    // Try to get base URL from current Jira tab
    const jiraTabs = await getJiraTabs()
    if (jiraTabs.length > 0) {
      const url = new URL(jiraTabs[0]?.url || '')
      baseUrl = url.origin
    }
  }

  if (!baseUrl) {
    log.error('No Jira base URL available')
    return false
  }

  const issueUrl = `${baseUrl}/browse/${issueKey}`
  const tab = await openInNewTab(issueUrl)
  return tab !== null
}
