import { defineContentScript } from '#imports'
import { browser } from '#imports'
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
  searchResults: '.issue-list tr[data-issue-key], .split-view-issue-list .issue-container'
}

export default defineContentScript({
  matches: ['https://*.atlassian.net/jira*'],
  main() {
    if (!isJiraWebPage(document)) return
    
    // Debounce function to avoid excessive collection
    let collectTimeout: NodeJS.Timeout

    const debounceCollect = (fn: () => void, delay: number) => {
      clearTimeout(collectTimeout)
      collectTimeout = setTimeout(fn, delay)
    }

    /**
     * Extract ticket key from various sources on a card element
     */
    const extractTicketKey = (element: Element): string | null => {
      // Try data-issue-key attribute first (most reliable)
      let key = element.getAttribute('data-issue-key')
      if (key) {
        console.log('✅ Found ticket key from data-issue-key:', key)
        return key
      }
      
      // Try card ID (format: card-KEY-123)
      const cardId = element.getAttribute('id')
      if (cardId?.startsWith('card-')) {
        const extractedKey = cardId.replace('card-', '')
        if (/^[A-Z]+-\d+$/.test(extractedKey)) {
          console.log('✅ Found ticket key from card ID:', extractedKey)
          return extractedKey
        }
      }
      
      // Try ticket key element (new Jira interface)
      const keyElement = element.querySelector(SELECTORS.ticketKey)
      if (keyElement) {
        const keyText = keyElement.textContent?.trim()
        if (keyText && /^[A-Z]+-\d+$/.test(keyText)) {
          console.log('✅ Found ticket key from key element:', keyText)
          return keyText
        }
      }
      
      // Try finding key from internal link
      const linkElement = element.querySelector(SELECTORS.issueLink)
      if (linkElement) {
        const href = linkElement.getAttribute('href')
        const keyMatch = href?.match(/\/browse\/([A-Z]+-\d+)/)
        if (keyMatch) {
          console.log('✅ Found ticket key from link:', keyMatch[1])
          return keyMatch[1]
        }
      }
      
      return null
    }
    
    /**
     * Extract unique ticket keys from different page types
     */
    const extractTicketKeysFromPage = (): string[] => {
      const ticketKeys = new Set<string>()
      const currentUrl = window.location.href
      
      console.log('🔍 ExtractTicketKeysFromPage: Starting key extraction for:', currentUrl)

      // Method 1: Extract from board/card views
      const cards = document.querySelectorAll(SELECTORS.cards)
      console.log(`🎫 Found ${cards.length} card elements`)
      
      cards.forEach((card, index) => {
        const key = extractTicketKey(card)
        if (key) {
          ticketKeys.add(key)
          console.log(`✅ Card ${index + 1}: Found key ${key}`)
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

      // Method 3: Extract from search results
      const searchRows = document.querySelectorAll(SELECTORS.searchResults)
      console.log(`📋 Found ${searchRows.length} search result elements`)
      
      searchRows.forEach((row, index) => {
        const key = extractTicketKey(row)
        if (key) {
          ticketKeys.add(key)
          console.log(`✅ Search result ${index + 1}: Found key ${key}`)
        }
      })

      // Method 4: Extract from all links containing /browse/
      const browseLinks = document.querySelectorAll(SELECTORS.issueLink)
      console.log(`🔗 Found ${browseLinks.length} browse links`)
      
      browseLinks.forEach((link, index) => {
        const href = link.getAttribute('href')
        if (href) {
          const keyMatch = href.match(/\/browse\/([A-Z]+-\d+)/)
          if (keyMatch) {
            ticketKeys.add(keyMatch[1])
            console.log(`✅ Link ${index + 1}: Found key ${keyMatch[1]}`)
          }
        }
      })

      const uniqueKeys = Array.from(ticketKeys)
      console.log(`🎯 ExtractTicketKeysFromPage: Extracted ${uniqueKeys.length} unique ticket keys:`, uniqueKeys)
      return uniqueKeys
    }

    /**
     * Collect tickets using background script API approach
     */
    const collectTicketData = async () => {
      console.log('\n🚀 =========================')
      console.log('🚀 STARTING TICKET COLLECTION (BACKGROUND-BASED)')
      console.log('🚀 =========================')
      
      try {
        // Step 1: Extract ticket keys from DOM
        const ticketKeys = extractTicketKeysFromPage()
        
        if (ticketKeys.length === 0) {
          console.log('❌ No ticket keys found on page')
          return
        }

        console.log(`🚀 Content: Sending ${ticketKeys.length} ticket keys to background script`)
        
        // Step 2: Send ticket keys to background script for API processing
        const response = await browser.runtime.sendMessage({
          type: 'FETCH_TICKET_DETAILS',
          ticketKeys: ticketKeys
        })
        
        if (!response.success) {
          console.error('❌ Background script failed to fetch tickets:', response.error)
          return
        }
        
        const tickets: JiraTicket[] = response.tickets
        console.log(`✅ Content: Received ${tickets.length}/${ticketKeys.length} tickets from background`)

        // Step 3: Process collected tickets
        if (tickets.length > 0) {
          console.log(`\n✅ SUCCESS: Collected ${tickets.length} tickets`)
          console.log('📊 Ticket Summary:')
          console.table(tickets.map(ticket => ({
            Key: ticket.key,
            Summary: ticket.summary.substring(0, 50) + (ticket.summary.length > 50 ? '...' : ''),
            Status: ticket.status || 'Unknown',
            Assignee: ticket.assignee || 'Unassigned',
            Priority: ticket.priority || 'None',
            Project: ticket.projectKey
          })))
          
          console.log('💾 Merging tickets with existing data...')
          await mergeTicketsData(tickets)
          console.log('✅ Tickets successfully saved to storage')
        } else {
          console.log('⚠️ No tickets were successfully fetched')
        }

      } catch (error) {
        console.error('❌ ERROR collecting ticket data:', error)
      }
      
      console.log('🏁 TICKET COLLECTION COMPLETED')
      console.log('🏁 =========================\n')
    }

    /**
     * Merge new tickets with existing data
     */
    const mergeTicketsData = async (newTickets: JiraTicket[]) => {
      console.log(`💾 MergeTicketsData: Starting merge process with ${newTickets.length} new tickets`)
      
      const existingTickets = (await storageItems[StorageKey.TicketsData].getValue()) || []
      console.log(`💾 MergeTicketsData: Found ${existingTickets.length} existing tickets in storage`)
      
      const ticketMap = new Map<string, JiraTicket>()

      // Add existing tickets to map
      existingTickets.forEach((ticket: JiraTicket) => {
        ticketMap.set(ticket.key, ticket)
      })
      console.log(`💾 MergeTicketsData: Added ${existingTickets.length} existing tickets to map`)

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
          console.log(`💾 Updated ticket ${newTicket.key} (view count: ${merged.viewCount})`)
        } else {
          // Add new ticket
          ticketMap.set(newTicket.key, newTicket)
          addedCount++
          console.log(`💾 Added new ticket ${newTicket.key}`)
        }
      })

      console.log(`💾 MergeTicketsData: Updated ${updatedCount} tickets, added ${addedCount} new tickets`)

      // Convert back to array and limit size (keep most recent 1000 tickets)
      const mergedTickets = Array.from(ticketMap.values())
        .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
        .slice(0, 1000)

      console.log(`💾 MergeTicketsData: Final merged collection has ${mergedTickets.length} tickets (limited to 1000)`)
      
      await storageItems[StorageKey.TicketsData].setValue(mergedTickets)
      console.log('💾 MergeTicketsData: Successfully saved to storage')
    }

    // Initial collection on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        debounceCollect(collectTicketData, 2000)
      })
    } else {
      debounceCollect(collectTicketData, 2000)
    }

    // Observe for dynamic content changes (SPA navigation)
    const observer = new MutationObserver(() => {
      debounceCollect(collectTicketData, 3000)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })

    // Handle navigation changes
    let lastUrl = window.location.href
    const checkUrlChange = () => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        debounceCollect(collectTicketData, 2000)
      }
    }

    setInterval(checkUrlChange, 1000)

    return () => {
      observer.disconnect()
      clearTimeout(collectTimeout)
    }
  }
})