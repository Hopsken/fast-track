import { defineContentScript } from '#imports'

import $ from 'cash-dom'
import screenfull from 'screenfull'

import { StorageKey } from '~/storage/keys'
import { storageItems } from '~/storage/storage-items'
import { isJiraWebPage } from '~/utils/jira/page-detection'

export default defineContentScript({
  matches: ['https://*.atlassian.net/jira*'],
  allFrames: true,

  async main() {
    if (!isJiraWebPage(document)) return
    if (!screenfull.isEnabled) return

    await registerAutoEnterFullScreen()
  }
})

/**
 * Registers event listeners for auto fullscreen mode
 */
async function registerAutoEnterFullScreen(): Promise<void> {
  let isAutoEnterFullScreen =
    await storageItems[StorageKey.AutoFullScreen].getValue()

  // Watch for setting changes
  storageItems[StorageKey.AutoFullScreen].watch((newValue) => {
    isAutoEnterFullScreen = newValue
  })

  // Selectors for fullscreen trigger buttons
  const triggerSelectors = [
    'button[data-testid="platform.ui.fullscreen-button.fullscreen-button"]',
    'button.js-compact-toggle'
  ].join(', ')

  // Set up event delegation on the Jira container
  $('#jira').on('click', triggerSelectors, () => {
    if (!isAutoEnterFullScreen) return

    if (screenfull.isFullscreen) {
      if (isInJiraNativeFullScreenMode()) {
        screenfull.exit()
      }
    } else {
      if (!isInJiraNativeFullScreenMode()) {
        screenfull.request()
      }
    }
  })
}

/**
 * Checks if Jira is in native fullscreen mode
 */
function isInJiraNativeFullScreenMode(): boolean {
  return $('#fullscreen-global-style').length > 0
}
