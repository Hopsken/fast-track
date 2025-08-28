import { StorageKey, JiraTicket, storageItems } from '~/storage'

// Selector patterns for different Jira elements
const SELECTORS = {
  // Card containers
  cards: [
    '[data-testid="platform-board-kit.ui.card.card"]',
    '[id^="card-"]',
    '[data-issue-key]'
  ].join(', '),
  
  // Summary text
  summary: [
    '[data-component-selector="issue-field-summary-inline-edit.ui.read.static-summary"]',
    '[data-component-selector="issue-field-summary-inline-edit.ui.read.editable-summary"]',
    '[data-testid="issue.views.issue-base.foundation.summary.heading"]',
    'h1[data-testid*="summary"]',
    '.ghx-summary',
    '#summary-val',
    '[data-component-selector="platform-card.ui.card.card-content.content-section"] span[class$="_summary"]'
  ].join(', '),
  
  // Status information
  status: [
    '[data-testid="issue.views.issue-base.foundation.status.status-lozenge"] span',
    '[data-testid="issue.views.issue-base.foundation.status.status-lozenge"]',
    '[data-testid*="status"] span',
    '.ghx-status',
    '#status-val'
  ].join(', '),
  
  // Assignee information
  assignee: [
    '[data-testid="issue.views.issue-base.foundation.assignee.assignee.value"] span',
    '[data-testid="issue.views.issue-base.foundation.assignee.assignee.value"]',
    '[data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper"] img',
    '[data-testid*="assignee"] span',
    '[aria-labelledby*="assignee"]',
    '.ghx-avatar img',
    '#assignee-val'
  ].join(', '),
  
  // Priority information
  priority: [
    '[data-testid="issue.views.issue-base.foundation.priority.priority-lozenge"] span',
    '[data-testid="issue.views.issue-base.foundation.priority.priority-lozenge"]',
    '[data-testid*="priority"] span',
    'img[alt*="Priority"]',
    'img[src*="priority"]',
    '.ghx-priority',
    '#priority-val'
  ].join(', '),
  
  // Issue type
  issueType: [
    'img[alt*="Task"]',
    'img[alt*="Bug"]', 
    'img[alt*="Story"]',
    'img[src*="issuetype"]'
  ].join(', '),
  
  // Board name
  boardName: [
    '[data-testid="platform-board-kit.common.board-header.board-name"]',
    '.js-board-title',
    '.bread-crumb-list a'
  ].join(', '),
  
  // Issue links and keys
  issueLink: 'a[href*="/browse/"]',
  ticketKey: '[data-testid="platform-card.common.ui.key.key"]',
  
  // Search results
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
      console.log('🔍 Extracting ticket key from element:', element)
      
      // Try data-issue-key attribute first
      let key = element.getAttribute('data-issue-key')
      if (key) {
        console.log('✅ Found ticket key from data-issue-key:', key)
        return key
      }
      
      // Try card ID (format: card-KEY-123)
      const cardId = element.getAttribute('id')
      if (cardId?.startsWith('card-')) {
        const extractedKey = cardId.replace('card-', '')
        console.log('✅ Found ticket key from card ID:', extractedKey)
        return extractedKey
      }
      
      // Try ticket key element (new Jira interface)
      const keyElement = element.querySelector(SELECTORS.ticketKey)
      if (keyElement) {
        const keyText = keyElement.textContent?.trim()
        console.log('🔍 Found key element text:', keyText)
        if (keyText && /^[A-Z]+-\d+$/.test(keyText)) {
          console.log('✅ Found ticket key from key element:', keyText)
          return keyText
        }
      }
      
      // Try finding key from internal link
      const linkElement = element.querySelector(SELECTORS.issueLink)
      if (linkElement) {
        const href = linkElement.getAttribute('href')
        console.log('🔍 Found link href:', href)
        const keyMatch = href?.match(/\/browse\/([A-Z]+-\d+)/)
        if (keyMatch) {
          console.log('✅ Found ticket key from link:', keyMatch[1])
          return keyMatch[1]
        }
      }
      
      console.log('❌ No ticket key found for element')
      return null
    }
    
    /**
     * Extract text content or attribute value from element
     */
    const extractValue = (element: Element | null, attributes: string[] = ['alt', 'title']): string | undefined => {
      if (!element) {
        console.log('🔍 ExtractValue: Element is null')
        return undefined
      }
      
      console.log('🔍 ExtractValue: Processing element:', element.tagName, element.className)
      
      // Try text content first
      const textContent = element.textContent?.trim()
      if (textContent) {
        console.log('✅ ExtractValue: Found text content:', textContent)
        return textContent
      }
      
      // Try specified attributes
      for (const attr of attributes) {
        const value = element.getAttribute(attr)
        if (value) {
          console.log(`✅ ExtractValue: Found value in ${attr} attribute:`, value)
          return value
        }
      }
      
      console.log('❌ ExtractValue: No value found')
      return undefined
    }
    
    /**
     * Create ticket object from extracted data
     */
    const createTicket = (key: string, summary: string, status?: string, assignee?: string, priority?: string, boardName?: string): JiraTicket => {
      return {
        id: key.split('-').slice(-1)[0],
        key,
        summary,
        status: status || '',
        assignee,
        priority,
        projectKey: key.split('-')[0],
        boardName,
        url: `${window.location.origin}/browse/${key}`,
        lastViewed: new Date().toISOString(),
        viewCount: 1
      }
    }
    
    /**
     * Collect tickets from board view cards
     */
    const collectFromBoardView = (): JiraTicket[] => {
      console.log('🏊 CollectFromBoardView: Starting board view collection')
      const tickets: JiraTicket[] = []
      const ticketCards = document.querySelectorAll(SELECTORS.cards)
      const boardName = extractValue(document.querySelector(SELECTORS.boardName))
      
      console.log(`🏊 CollectFromBoardView: Found ${ticketCards.length} ticket cards`)
      console.log('🏊 CollectFromBoardView: Board name:', boardName)
      
      ticketCards.forEach((card, index) => {
        console.log(`\n🎫 Processing card ${index + 1}/${ticketCards.length}:`, card)
        
        const ticketKey = extractTicketKey(card)
        if (!ticketKey) {
          console.log('❌ Skipping card - no ticket key found')
          return
        }
        
        console.log(`🔍 Card ${index + 1}: Extracting summary`)
        const summary = extractValue(card.querySelector(SELECTORS.summary))
        if (!summary || summary.length === 0) {
          console.log(`❌ Skipping card ${ticketKey} - no valid summary (found: "${summary}")`)
          return
        }
        
        console.log(`🔍 Card ${index + 1}: Extracting status`)
        const status = extractValue(card.querySelector(SELECTORS.status))
        
        console.log(`🔍 Card ${index + 1}: Extracting assignee`)
        const assignee = extractValue(card.querySelector(SELECTORS.assignee))
        
        console.log(`🔍 Card ${index + 1}: Extracting priority`)
        const priority = extractValue(card.querySelector(SELECTORS.priority)) || 
                        extractValue(card.querySelector(SELECTORS.issueType))
        
        const ticket = createTicket(ticketKey, summary, status, assignee, priority, boardName)
        tickets.push(ticket)
        console.log(`✅ Card ${index + 1}: Successfully created ticket:`, ticket)
      })
      
      console.log(`🏊 CollectFromBoardView: Completed - collected ${tickets.length} tickets`)
      return tickets
    }
    
    /**
     * Collect ticket from issue detail view
     */
    const collectFromIssueView = (url: string): JiraTicket[] => {
      console.log('🎯 CollectFromIssueView: Starting issue view collection for:', url)
      
      const keyMatch = url.match(/\/browse\/([A-Z]+-\d+)/)
      if (!keyMatch) {
        console.log('❌ CollectFromIssueView: No ticket key found in URL')
        return []
      }
      
      const ticketKey = keyMatch[1]
      console.log('✅ CollectFromIssueView: Found ticket key:', ticketKey)
      
      console.log('🔍 CollectFromIssueView: Extracting summary')
      const summary = extractValue(document.querySelector(SELECTORS.summary))
      
      if (!summary || summary.length === 0) {
        console.log(`❌ CollectFromIssueView: No valid summary found (found: "${summary}")`)
        return []
      }
      
      console.log('🔍 CollectFromIssueView: Extracting status')
      const status = extractValue(document.querySelector(SELECTORS.status))
      
      console.log('🔍 CollectFromIssueView: Extracting assignee')
      const assignee = extractValue(document.querySelector(SELECTORS.assignee))
      
      console.log('🔍 CollectFromIssueView: Extracting priority')
      const priority = extractValue(document.querySelector(SELECTORS.priority))
      
      const ticket = createTicket(ticketKey, summary, status, assignee, priority)
      console.log('✅ CollectFromIssueView: Successfully created ticket:', ticket)
      
      return [ticket]
    }
    
    /**
     * Collect tickets from search results
     */
    const collectFromSearchResults = (): JiraTicket[] => {
      console.log('🔍 CollectFromSearchResults: Starting search results collection')
      const tickets: JiraTicket[] = []
      const issueRows = document.querySelectorAll(SELECTORS.searchResults)
      
      console.log(`🔍 CollectFromSearchResults: Found ${issueRows.length} search result rows`)
      
      issueRows.forEach((row, index) => {
        console.log(`\n📋 Processing search result ${index + 1}/${issueRows.length}:`, row)
        
        const ticketKey = extractTicketKey(row)
        if (!ticketKey) {
          console.log('❌ Skipping search result - no ticket key found')
          return
        }
        
        console.log(`🔍 Search result ${index + 1}: Extracting summary`)
        const summary = extractValue(row.querySelector('.summary a, .issue-link'))
        if (!summary || summary.length === 0) {
          console.log(`❌ Skipping search result ${ticketKey} - no valid summary (found: "${summary}")`)
          return
        }
        
        console.log(`🔍 Search result ${index + 1}: Extracting status`)
        const status = extractValue(row.querySelector('.status, .issue-status'))
        
        console.log(`🔍 Search result ${index + 1}: Extracting assignee`)
        const assignee = extractValue(row.querySelector('.assignee, .issue-assignee'))
        
        console.log(`🔍 Search result ${index + 1}: Extracting priority`)
        const priority = extractValue(row.querySelector('.priority, .issue-priority'))
        
        const ticket = createTicket(ticketKey, summary, status, assignee, priority)
        tickets.push(ticket)
        console.log(`✅ Search result ${index + 1}: Successfully created ticket:`, ticket)
      })
      
      console.log(`🔍 CollectFromSearchResults: Completed - collected ${tickets.length} tickets`)
      return tickets
    }

    // Collect ticket data from current page
    const collectTicketData = async () => {
      console.log('\n🚀 =========================')
      console.log('🚀 STARTING TICKET COLLECTION')
      console.log('🚀 =========================')
      
      try {
        let tickets: JiraTicket[] = []
        const currentUrl = window.location.href
        console.log('🌐 Current URL:', currentUrl)

        // Detect page type and collect accordingly
        if (currentUrl.includes('/boards/')) {
          console.log('📋 Detected: Board view page')
          tickets = collectFromBoardView()
        }
        else if (currentUrl.includes('/browse/')) {
          console.log('🎯 Detected: Issue detail view page')
          tickets = collectFromIssueView(currentUrl)
        }
        else if (currentUrl.includes('/issues/') || currentUrl.includes('/?filter=')) {
          console.log('🔍 Detected: Search results page')
          tickets = collectFromSearchResults()
        }
        else {
          console.log('❓ Unknown page type - attempting all collection methods')
          // Try all methods if page type is unclear
          const boardTickets = collectFromBoardView()
          const issueTickets = collectFromIssueView(currentUrl)
          const searchTickets = collectFromSearchResults()
          tickets = [...boardTickets, ...issueTickets, ...searchTickets]
        }

        // Process collected tickets
        if (tickets.length > 0) {
          console.log(`\n✅ SUCCESS: Collected ${tickets.length} tickets from ${currentUrl}`)
          console.log('📊 Ticket Summary:')
          console.table(tickets.map(ticket => ({
            Key: ticket.key,
            Summary: ticket.summary.substring(0, 50) + (ticket.summary.length > 50 ? '...' : ''),
            Status: ticket.status || 'Unknown',
            Assignee: ticket.assignee || 'Unassigned',
            Priority: ticket.priority || 'None',
            Project: ticket.projectKey,
            Board: ticket.boardName || 'N/A'
          })))
          console.log('💾 Merging tickets with existing data...')
          await mergeTicketsData(tickets)
          console.log('✅ Tickets successfully saved to storage')
        } else {
          console.log(`\n❌ NO TICKETS FOUND on ${currentUrl}`)
          
          // Enhanced debug information
          console.log('\n🔍 DEBUG INFORMATION:')
          const cards = document.querySelectorAll(SELECTORS.cards)
          console.log(`- Card elements found: ${cards.length}`)
          if (cards.length > 0) {
            console.log('- Card elements details:')
            cards.forEach((card, i) => {
              console.log(`  Card ${i + 1}:`, {
                id: card.id,
                className: card.className,
                'data-issue-key': card.getAttribute('data-issue-key'),
                tagName: card.tagName
              })
            })
          }
          
          console.log(`- Summary elements found: ${document.querySelectorAll(SELECTORS.summary).length}`)
          console.log(`- Status elements found: ${document.querySelectorAll(SELECTORS.status).length}`)
          console.log(`- Search result elements found: ${document.querySelectorAll(SELECTORS.searchResults).length}`)
          console.log('- Page readyState:', document.readyState)
        }
      } catch (error) {
        console.error('❌ ERROR collecting ticket data:', error)
        console.error('Stack trace:', error.stack)
      }
      
      console.log('🏁 TICKET COLLECTION COMPLETED')
      console.log('🏁 =========================\n')
    }

    // Merge new tickets with existing data
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