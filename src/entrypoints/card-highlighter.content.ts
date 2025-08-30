import { TinyColor } from '@ctrl/tinycolor'

import { defineContentScript } from '#imports'
import { StorageKey } from '~/storage/keys'
import { storageItems } from '~/storage/storage-items'
import {
  globalObserverManager,
  createDebouncedCallback
} from '~/utils/dom/mutation-observer'
import {
  isJiraWebPage,
  getJiraApp,
  getKanbanBoard
} from '~/utils/jira/page-detection'

export default defineContentScript({
  matches: ['https://*.atlassian.net/jira*'],
  allFrames: true,

  async main() {
    if (!isJiraWebPage(document)) return

    // Initialize card highlighting based on current settings
    let isHighlightEnabled = await storageItems[StorageKey.ColorCard].getValue()

    // Set up mutation observer for dynamic content
    setupCardHighlighter(isHighlightEnabled)

    // Watch for setting changes
    storageItems[StorageKey.ColorCard].watch((newValue) => {
      isHighlightEnabled = !!newValue
      updateCardColors(isHighlightEnabled)
    })

    return () => {
      globalObserverManager.disconnect('card-highlighter')
    }
  }
})

/**
 * Sets up the card highlighter with mutation observer
 */
function setupCardHighlighter(enabled: boolean): void {
  const jiraApp = getJiraApp(document)
  if (!jiraApp) return

  // Initial highlight
  if (enabled) {
    updateCardColors(true)
  }

  // Watch for DOM changes and re-apply highlighting
  const debouncedCallback = createDebouncedCallback(() => {
    updateCardColors(enabled)
  }, 500)

  globalObserverManager.observe(
    'card-highlighter',
    jiraApp,
    debouncedCallback,
    { childList: true, subtree: true }
  )
}

/**
 * Updates card colors based on current setting
 */
function updateCardColors(highlight: boolean): void {
  const kanban = getKanbanBoard(document)
  if (!kanban) return

  const cards = kanban.querySelectorAll(`[class*="ghx-type-"]`)

  cards.forEach((card) => {
    if (!(card instanceof HTMLElement)) return

    if (highlight) {
      highlightCard(card)
    } else {
      removeCardHighlight(card)
    }
  })
}

/**
 * Highlights a single card based on its grabber color
 */
function highlightCard(card: HTMLElement): void {
  if (!card) return

  const grabber = card.querySelector('.ghx-grabber') as HTMLElement
  const backgroundColor = grabber?.style.backgroundColor

  if (!backgroundColor) return

  try {
    const color = new TinyColor(backgroundColor)
    card.style.background = color.setAlpha(0.3).toRgbString()
  } catch (error) {
    console.warn('Failed to highlight card:', error)
  }
}

/**
 * Removes highlight from a card
 */
function removeCardHighlight(card: HTMLElement): void {
  card.style.background = 'unset'
}
