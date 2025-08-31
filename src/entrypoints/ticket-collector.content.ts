import { defineContentScript } from '#imports'

import { getTicketService } from '~/services/ticket-service'
import { StorageKey, JiraTicket, storageItems } from '~/storage'
import { isJiraWebPage } from '~/utils/jira/page-detection'

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

    console.log('🔧 DEBUG: Using proxy service for ticket collection')
    console.log('   Extension context:', 'content-script')
    console.log('   Service type:', 'TicketService via proxy-service')

    // Smart debouncing with different delays for different triggers
    let collectTimeout: NodeJS.Timeout
    let lastCollectionTime = 0
    let lastUrl = window.location.href
    let lastTicketCount = 0

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
      collectTimeout = setTimeout(async () => {
        try {
          await collectTicketData(trigger)
          lastCollectionTime = Date.now()
        } catch (error) {
          console.error('Collection failed:', error)
        }
      }, delay)
    }

    /**
     * Extract ticket key from various sources on a card element
     */
    const extractTicketKey = (element: Element): string | null => {
      // Try data-issue-key attribute first (most reliable)
      let key = element.getAttribute('data-issue-key')
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

      console.log(
        '🔍 ExtractTicketKeysFromPage: Starting key extraction for:',
        currentUrl
      )

      // Method 1: Extract from board/card views
      const cards = document.querySelectorAll(SELECTORS.cards)
      console.log(`🎫 Found ${cards.length} card elements`)

      cards.forEach((card, index) => {
        const key = extractTicketKey(card)
        if (key) {
          ticketKeys.add(key)
          if (index < 5) {
            // Only log first few for brevity
            console.log(`✅ Card ${index + 1}: Found key ${key}`)
          }
        }
      })

      // Method 2: Extract from current URL if on issue page
      if (currentUrl.includes('/browse/')) {
        const urlKeyMatch = currentUrl.match(/\/browse\/([A-Z]+-\d+)/)
        if (urlKeyMatch) {
          ticketKeys.add(urlKeyMatch[1])
          console.log(`✅ URL: Found key ${urlKeyMatch[1]}`)
        }
      }

      // Method 3: Extract from search results (only if we have few cards)
      if (ticketKeys.size < 10) {
        const searchRows = document.querySelectorAll(SELECTORS.searchResults)
        console.log(`📋 Found ${searchRows.length} search result elements`)

        searchRows.forEach((row, index) => {
          const key = extractTicketKey(row)
          if (key) {
            ticketKeys.add(key)
            if (index < 3) {
              // Only log first few for brevity
              console.log(`✅ Search result ${index + 1}: Found key ${key}`)
            }
          }
        })
      }

      // Method 4: Extract from browse links (limited to prevent overwhelming)
      if (ticketKeys.size < 20) {
        const browseLinks = Array.from(
          document.querySelectorAll(SELECTORS.issueLink)
        ).slice(0, 50) // Limit to first 50 links to prevent performance issues
        console.log(
          `🔗 Processing ${browseLinks.length} browse links (limited)`
        )

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

      const uniqueKeys = Array.from(ticketKeys)
      console.log(
        `🎯 ExtractTicketKeysFromPage: Extracted ${uniqueKeys.length} unique ticket keys`
      )

      // Only log keys if count changed significantly
      if (Math.abs(uniqueKeys.length - lastTicketCount) > 2) {
        console.log(
          'Keys:',
          uniqueKeys.slice(0, 10),
          uniqueKeys.length > 10 ? `...and ${uniqueKeys.length - 10} more` : ''
        )
        lastTicketCount = uniqueKeys.length
      }

      return uniqueKeys
    }

    /**
     * Collect tickets using background script API approach
     */
    const collectTicketData = async (trigger: 'dom' | 'url' | 'initial') => {
      console.log(`\n🚀 STARTING TICKET COLLECTION (${trigger.toUpperCase()})`)

      try {
        // Step 1: Extract ticket keys from DOM
        const ticketKeys = extractTicketKeysFromPage()

        if (ticketKeys.length === 0) {
          console.log('❌ No ticket keys found on page')
          return
        }

        console.log(
          `🚀 Content: Fetching ${ticketKeys.length} tickets via proxy service`
        )

        // Step 2: Get ticket service instance and call directly
        const ticketService = getTicketService()
        const tickets = await ticketService.fetchTicketDetails(ticketKeys)

        console.log(
          `✅ Content: Received ${tickets.length}/${ticketKeys.length} tickets from background`
        )

        // Step 3: Process collected tickets
        if (tickets.length > 0) {
          console.log(`✅ SUCCESS: Collected ${tickets.length} tickets`)

          // Only show detailed table for significant collections
          if (tickets.length > 5 || trigger === 'initial') {
            console.log('📊 Ticket Summary:')
            console.table(
              tickets.slice(0, 10).map((ticket) => ({
                Key: ticket.key,
                Summary:
                  ticket.summary.substring(0, 50) +
                  (ticket.summary.length > 50 ? '...' : ''),
                Status: ticket.status || 'Unknown',
                Assignee: ticket.assignee || 'Unassigned',
                Priority: ticket.priority || 'None',
                Project: ticket.projectKey
              }))
            )
            if (tickets.length > 10) {
              console.log(`... and ${tickets.length - 10} more tickets`)
            }
          }

          console.log('💾 Merging tickets with existing data...')
          await mergeTicketsData(tickets)
          console.log('✅ Tickets successfully saved to storage')
        } else {
          console.log('⚠️ No tickets were successfully fetched')
        }
      } catch (error) {
        console.error('❌ ERROR collecting ticket data:', error)

        // Provide detailed error information
        if (error instanceof Error) {
          console.error('   Error name:', error.name)
          console.error('   Error message:', error.message)
        }
      }

      console.log('🏁 TICKET COLLECTION COMPLETED\n')
    }

    /**
     * Merge new tickets with existing data
     */
    const mergeTicketsData = async (newTickets: JiraTicket[]) => {
      console.log(
        `💾 MergeTicketsData: Starting merge process with ${newTickets.length} new tickets`
      )

      const existingTickets =
        (await storageItems[StorageKey.TicketsData].getValue()) || []
      console.log(
        `💾 MergeTicketsData: Found ${existingTickets.length} existing tickets in storage`
      )

      const ticketMap = new Map<string, JiraTicket>()

      // Add existing tickets to map
      existingTickets.forEach((ticket: JiraTicket) => {
        ticketMap.set(ticket.key, ticket)
      })

      // Merge new tickets
      let updatedCount = 0
      let addedCount = 0

      newTickets.forEach((newTicket) => {
        const existing = ticketMap.get(newTicket.key)
        if (existing) {
          // Update existing ticket with new data and increment view count
          const merged = {
            ...existing,
            ...newTicket,
            viewCount: existing.viewCount + 1,
            lastViewed: newTicket.lastViewed
          }
          ticketMap.set(newTicket.key, merged)
          updatedCount++
        } else {
          // Add new ticket
          ticketMap.set(newTicket.key, newTicket)
          addedCount++
        }
      })

      console.log(
        `💾 MergeTicketsData: Updated ${updatedCount} tickets, added ${addedCount} new tickets`
      )

      // Convert back to array and limit size (keep most recent 1000 tickets)
      const mergedTickets = Array.from(ticketMap.values())
        .sort(
          (a, b) =>
            new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
        )
        .slice(0, 1000)

      console.log(
        `💾 MergeTicketsData: Final merged collection has ${mergedTickets.length} tickets (limited to 1000)`
      )

      await storageItems[StorageKey.TicketsData].setValue(mergedTickets)
      console.log('💾 MergeTicketsData: Successfully saved to storage')
    }

    // Enhanced URL change detection
    const checkUrlChange = () => {
      if (window.location.href !== lastUrl) {
        console.log('🔄 URL changed from', lastUrl, 'to', window.location.href)
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

    // Smart DOM observation with throttling
    let observationCount = 0
    const MAX_OBSERVATIONS = 50 // Limit observations per session

    const observer = new MutationObserver((mutations) => {
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
        console.log('⚠️ DOM observation limit reached, reducing frequency')
        observer.disconnect()
        // Reconnect with reduced sensitivity after a delay
        setTimeout(() => {
          observationCount = 0
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
          })
        }, 30000) // 30 second break
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })

    // URL change detection with reduced frequency
    const urlCheckInterval = setInterval(checkUrlChange, 2000) // Check every 2 seconds instead of 1

    // Cleanup function
    return () => {
      observer.disconnect()
      clearTimeout(collectTimeout)
      clearInterval(urlCheckInterval)
      console.log('🧹 Ticket collector cleanup completed')
    }
  }
})
