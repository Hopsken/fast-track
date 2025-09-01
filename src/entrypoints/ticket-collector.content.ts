import { defineContentScript } from '#imports'

import { sendMessage } from '~/lib/messaging'
import { isJiraWebPage } from '~/utils/jira/page-detection'
import { logger } from '~/utils/logger'

// Create a namespaced logger for ticket collection
const log = logger.namespace('TicketCollector')

// Simplified selectors focusing only on ticket key extraction
const SELECTORS = {
  // Card containers - most reliable selectors for finding ticket cards
  cards: [
    '[data-testid="platform-board-kit.ui.card.card"]',
    '[id^="card-"]',
    '[data-issue-key]'
  ].join(', '),

  // Ticket key selectors - specific elements that contain ticket keys
  ticketKey: '[data-testid="platform-card.common.ui.key.key"]',
  issueLink: 'a[href*="/browse/"]',

  // Search results for other page types
  searchResults:
    '.issue-list tr[data-issue-key], .split-view-issue-list .issue-container'
}

export default defineContentScript({
  matches: ['https://*.atlassian.net/jira*'],
  main() {
    if (!isJiraWebPage(document)) return

    // Smart debouncing with different delays for different triggers
    let collectTimeout: number
    let lastCollectionTime = 0
    let lastUrl = window.location.href

    // Enhanced debounce with adaptive delays and duplicate prevention
    const smartDebounceCollect = (
      trigger: 'dom' | 'url' | 'initial',
      delay: number
    ) => {
      const now = Date.now()

      // Prevent too frequent collections (minimum 5 seconds between collections)
      if (now - lastCollectionTime < 5000) {
        return
      }

      clearTimeout(collectTimeout)
      collectTimeout = window.setTimeout(async () => {
        await collectTicketData(trigger)
        lastCollectionTime = Date.now()
      }, delay)
    }

    /**
     * Extract ticket key from various sources on a card element
     */
    const extractTicketKey = (element: Element): string | null => {
      // Try data-issue-key attribute first (most reliable)
      const key = element.getAttribute('data-issue-key')
      if (key) {
        return key
      }

      // Try card ID (format: card-KEY-123)
      const cardId = element.getAttribute('id')
      if (cardId?.startsWith('card-')) {
        const extractedKey = cardId.replace('card-', '')
        if (/^[A-Z]+-\d+$/.test(extractedKey)) {
          return extractedKey
        }
      }

      // Try ticket key element (new Jira interface)
      const keyElement = element.querySelector(SELECTORS.ticketKey)
      if (keyElement) {
        const keyText = keyElement.textContent?.trim()
        if (keyText && /^[A-Z]+-\d+$/.test(keyText)) {
          return keyText
        }
      }

      // Try finding key from internal link
      const linkElement = element.querySelector(SELECTORS.issueLink)
      if (linkElement) {
        const href = linkElement.getAttribute('href')
        const keyMatch = href?.match(/\/browse\/([A-Z]+-\d+)/)
        if (keyMatch) {
          return keyMatch[1]
        }
      }

      return null
    }

    /**
     * Extract unique ticket keys from different page types with smart caching
     */
    const extractTicketKeysFromPage = (): string[] => {
      const ticketKeys = new Set<string>()
      const currentUrl = window.location.href
      // Method 1: Extract from board/card views
      const cards = document.querySelectorAll(SELECTORS.cards)

      cards.forEach((card) => {
        const key = extractTicketKey(card)
        if (key) {
          ticketKeys.add(key)
        }
      })

      // Method 2: Extract from current URL if on issue page
      if (currentUrl.includes('/browse/')) {
        const urlKeyMatch = currentUrl.match(/\/browse\/([A-Z]+-\d+)/)
        if (urlKeyMatch) {
          ticketKeys.add(urlKeyMatch[1])
        }
      }

      // Method 3: Extract from search results (only if we have few cards)
      if (ticketKeys.size < 10) {
        const searchRows = document.querySelectorAll(SELECTORS.searchResults)

        searchRows.forEach((row) => {
          const key = extractTicketKey(row)
          if (key) {
            ticketKeys.add(key)
          }
        })
      }

      // Method 4: Extract from browse links (limited to prevent overwhelming)
      if (ticketKeys.size < 20) {
        const browseLinks = Array.from(
          document.querySelectorAll(SELECTORS.issueLink)
        ).slice(0, 50) // Limit to first 50 links to prevent performance issues

        browseLinks.forEach((link) => {
          const href = link.getAttribute('href')
          if (href) {
            const keyMatch = href.match(/\/browse\/([A-Z]+-\d+)/)
            if (keyMatch) {
              ticketKeys.add(keyMatch[1])
            }
          }
        })
      }

      return Array.from(ticketKeys)
    }

    /**
     * Collect tickets by sending keys to background service
     */
    const collectTicketData = async (trigger: 'dom' | 'url' | 'initial') => {
      log.debug(`🚀 Starting ticket key collection (${trigger.toUpperCase()})`)

      // Step 1: Extract ticket keys from DOM
      const ticketKeys = extractTicketKeysFromPage()

      if (ticketKeys.length === 0) {
        return
      }

      log.debug(
        `🚀 Extracted ${ticketKeys.length} ticket keys (${trigger.toUpperCase()})`
      )

      // Step 2: Send keys to background service for processing
      const result = await sendMessage('collectTickets', {
        keys: ticketKeys,
        trigger,
        url: window.location.href
      })

      if (!result.success) {
        throw new Error(`Background processing failed: ${result.error}`)
      }

      log.debug(`🚀 Ticket key collection completed (${trigger.toUpperCase()})`)
    }

    // Enhanced URL change detection
    const checkUrlChange = () => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        smartDebounceCollect('url', 1500) // Faster response for URL changes
      }
    }

    // Initial collection with longer delay to let page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        smartDebounceCollect('initial', 3000)
      })
    } else {
      smartDebounceCollect('initial', 2000)
    }

    // Performance-optimized DOM observation with targeted containers
    let observationCount = 0
    const MAX_OBSERVATIONS = 50 // Limit observations per session
    const observers: MutationObserver[] = []

    const createOptimizedObserver = () => {
      return new MutationObserver((mutations) => {
        observationCount++

        // Only process mutations that might contain ticket data
        const relevantMutation = mutations.some((mutation) => {
          const target = mutation.target as Element
          return (
            target.nodeType === Node.ELEMENT_NODE &&
            (target.matches?.(SELECTORS.cards) ||
              target.querySelector?.(SELECTORS.cards) ||
              target.matches?.(SELECTORS.searchResults) ||
              target.querySelector?.(SELECTORS.searchResults))
          )
        })

        if (relevantMutation && observationCount < MAX_OBSERVATIONS) {
          smartDebounceCollect('dom', 4000) // Longer delay for DOM changes
        } else if (observationCount >= MAX_OBSERVATIONS) {
          // Disconnect all observers temporarily
          disconnectAllObservers()
          // Reconnect with reduced sensitivity after a delay
          setTimeout(() => {
            observationCount = 0
            startTargetedObservation()
          }, 30000) // 30 second break
        }
      })
    }

    const disconnectAllObservers = () => {
      observers.forEach((observer) => observer.disconnect())
      observers.length = 0
    }

    const startTargetedObservation = () => {
      // Disconnect existing observers first
      disconnectAllObservers()

      // Target specific Jira containers instead of entire document.body
      const targetSelectors = [
        // Main board containers
        '[data-testid="platform-board-kit.ui.board.board"]',
        '[data-testid="software-board.board-container.board"]',
        // Issue list containers
        '.issue-list',
        '.split-view-issue-list',
        // Search result containers
        '#issuetable',
        '.navigator-content',
        // Backlog containers
        '.js-work-data',
        '.ghx-backlog-container'
      ]

      let observersCreated = 0
      targetSelectors.forEach((selector) => {
        const containers = document.querySelectorAll(selector)
        containers.forEach((container) => {
          if (container) {
            const observer = createOptimizedObserver()
            observer.observe(container, {
              childList: true,
              subtree: true,
              attributes: false
            })
            observers.push(observer)
            observersCreated++
            log.debug(`Started observing container: ${selector}`)
          }
        })
      })

      // Fallback: if no specific containers found, observe document.body with reduced scope
      if (observersCreated === 0) {
        log.debug(
          'No specific containers found, using document.body fallback with reduced scope'
        )
        const fallbackObserver = createOptimizedObserver()
        fallbackObserver.observe(document.body, {
          childList: true,
          subtree: false, // Reduced scope - only direct children
          attributes: false
        })
        observers.push(fallbackObserver)
      } else {
        log.debug(
          `Created ${observersCreated} targeted observers for DOM monitoring`
        )
      }
    }

    // Start the optimized observation
    startTargetedObservation()

    // URL change detection with reduced frequency
    const urlCheckInterval = setInterval(checkUrlChange, 2000) // Check every 2 seconds instead of 1

    // Cleanup function
    return () => {
      disconnectAllObservers()
      clearTimeout(collectTimeout)
      clearInterval(urlCheckInterval)
    }
  }
})
