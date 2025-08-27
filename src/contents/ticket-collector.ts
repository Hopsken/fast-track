import { StorageKey, JiraTicket } from '~/storage'
import { storage } from '#imports'

export default defineContentScript({
  matches: ['https://*.atlassian.net/jira*'],
  main() {
    // Debounce function to avoid excessive collection
    let collectTimeout: NodeJS.Timeout

    const debounceCollect = (fn: () => void, delay: number) => {
      clearTimeout(collectTimeout)
      collectTimeout = setTimeout(fn, delay)
    }

    // Collect ticket data from current page
    const collectTicketData = async () => {
      try {
        const tickets: JiraTicket[] = []
        const currentUrl = window.location.href
        const currentTime = new Date().toISOString()

        // Collect from board view (kanban/scrum boards)
        if (currentUrl.includes('/boards/')) {
          const ticketCards = document.querySelectorAll('[data-issue-key]')
          
          ticketCards.forEach((card) => {
            const ticketKey = card.getAttribute('data-issue-key')
            if (!ticketKey) return

            const summaryElement = card.querySelector('[data-testid="platform-card.ui.card.focus-ring.focus-ring"] span, .ghx-summary')
            const statusElement = card.querySelector('.ghx-status, [data-testid="issue.views.issue-base.foundation.status.status-lozenge"]')
            const assigneeElement = card.querySelector('.ghx-avatar img, [data-testid="issue.views.issue-base.foundation.avatar.avatar-with-tooltip"] img')
            const priorityElement = card.querySelector('.ghx-priority, [data-testid="issue.views.issue-base.foundation.priority.priority-lozenge"]')

            const ticket: JiraTicket = {
              id: ticketKey.split('-').slice(-1)[0],
              key: ticketKey,
              summary: summaryElement?.textContent?.trim() || '',
              status: statusElement?.textContent?.trim() || '',
              assignee: assigneeElement?.getAttribute('alt') || assigneeElement?.getAttribute('title') || undefined,
              priority: priorityElement?.getAttribute('alt') || priorityElement?.getAttribute('title') || undefined,
              projectKey: ticketKey.split('-')[0],
              boardName: document.querySelector('.js-board-title, .bread-crumb-list a')?.textContent?.trim(),
              url: `${window.location.origin}/browse/${ticketKey}`,
              lastViewed: currentTime,
              viewCount: 1
            }

            if (ticket.summary) {
              tickets.push(ticket)
            }
          })
        }

        // Collect from issue detail view
        if (currentUrl.includes('/browse/')) {
          const ticketKeyMatch = currentUrl.match(/\/browse\/([A-Z]+-\d+)/)
          if (ticketKeyMatch) {
            const ticketKey = ticketKeyMatch[1]
            const summaryElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"], #summary-val')
            const statusElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.status.status-lozenge"] span, #status-val')
            const assigneeElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.assignee.assignee.value"] span, #assignee-val')
            const priorityElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.priority.priority-lozenge"] span, #priority-val')

            const ticket: JiraTicket = {
              id: ticketKey.split('-').slice(-1)[0],
              key: ticketKey,
              summary: summaryElement?.textContent?.trim() || '',
              status: statusElement?.textContent?.trim() || '',
              assignee: assigneeElement?.textContent?.trim() || undefined,
              priority: priorityElement?.textContent?.trim() || undefined,
              projectKey: ticketKey.split('-')[0],
              url: currentUrl,
              lastViewed: currentTime,
              viewCount: 1
            }

            if (ticket.summary) {
              tickets.push(ticket)
            }
          }
        }

        // Collect from search results
        if (currentUrl.includes('/issues/') || currentUrl.includes('/?filter=')) {
          const issueRows = document.querySelectorAll('.issue-list tr[data-issue-key], .split-view-issue-list .issue-container')
          
          issueRows.forEach((row) => {
            const ticketKey = row.getAttribute('data-issue-key') || 
                            row.querySelector('a[href*="/browse/"]')?.getAttribute('href')?.match(/\/browse\/([A-Z]+-\d+)/)?.[1]
            
            if (!ticketKey) return

            const summaryElement = row.querySelector('.summary a, .issue-link')
            const statusElement = row.querySelector('.status, .issue-status')
            const assigneeElement = row.querySelector('.assignee, .issue-assignee')
            const priorityElement = row.querySelector('.priority, .issue-priority')

            const ticket: JiraTicket = {
              id: ticketKey.split('-').slice(-1)[0],
              key: ticketKey,
              summary: summaryElement?.textContent?.trim() || '',
              status: statusElement?.textContent?.trim() || '',
              assignee: assigneeElement?.textContent?.trim() || undefined,
              priority: priorityElement?.textContent?.trim() || undefined,
              projectKey: ticketKey.split('-')[0],
              url: `${window.location.origin}/browse/${ticketKey}`,
              lastViewed: currentTime,
              viewCount: 1
            }

            if (ticket.summary) {
              tickets.push(ticket)
            }
          })
        }

        if (tickets.length > 0) {
          await mergeTicketsData(tickets)
        }
      } catch (error) {
        console.error('Error collecting ticket data:', error)
      }
    }

    // Merge new tickets with existing data
    const mergeTicketsData = async (newTickets: JiraTicket[]) => {
      const existingTickets = await storage.getItem(`local:${StorageKey.TicketsData}`) || []
      const ticketMap = new Map<string, JiraTicket>()

      // Add existing tickets to map
      existingTickets.forEach((ticket: JiraTicket) => {
        ticketMap.set(ticket.key, ticket)
      })

      // Merge new tickets
      newTickets.forEach((newTicket) => {
        const existing = ticketMap.get(newTicket.key)
        if (existing) {
          // Update existing ticket with new data and increment view count
          ticketMap.set(newTicket.key, {
            ...existing,
            ...newTicket,
            viewCount: existing.viewCount + 1,
            lastViewed: newTicket.lastViewed
          })
        } else {
          // Add new ticket
          ticketMap.set(newTicket.key, newTicket)
        }
      })

      // Convert back to array and limit size (keep most recent 1000 tickets)
      const mergedTickets = Array.from(ticketMap.values())
        .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
        .slice(0, 1000)

      await storage.setItem(`local:${StorageKey.TicketsData}`, mergedTickets)
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