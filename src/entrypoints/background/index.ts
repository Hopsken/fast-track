import { browser } from '#imports'
import { openJiraIssue } from '~/utils/open-jira-issue'
import { openOptionsPage } from '~/utils/broswer'
import { JiraApiService } from '~/lib/jira-api'
import { StorageKey, PersistLayer, JiraTicket } from '~/storage'

const persistLayer = new PersistLayer()

export default defineBackground(() => {
  browser.omnibox.onInputEntered.addListener((text: string) => {
    // Event handler for user entering keyword and pressing space/enter
    openJiraIssue(text)
  })

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      openOptionsPage()
    }
  })

  // Handle messages from content scripts
  browser.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    if (message.type === 'FETCH_TICKET_DETAILS') {
      try {
        const { ticketKeys } = message
        const tickets = await fetchTicketDetails(ticketKeys)
        sendResponse({ success: true, tickets })
      } catch (error) {
        console.error('Failed to fetch ticket details:', error)
        sendResponse({ success: false, error: (error as Error).message })
      }
      return true // Keep message channel open for async response
    }
  })
})

async function fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
  console.log('🔄 Background: Fetching details for tickets:', ticketKeys)
  
  // Get API configuration from storage
  const [jiraHost, apiToken, userEmail] = await Promise.all([
    persistLayer.get(StorageKey.JiraHost),
    persistLayer.get(StorageKey.JiraApiToken),
    persistLayer.get(StorageKey.JiraUserEmail)
  ])

  if (!jiraHost || !apiToken || !userEmail) {
    throw new Error('Jira API configuration is incomplete. Please configure API settings.')
  }

  const apiService = new JiraApiService({
    baseUrl: jiraHost,
    email: userEmail,
    apiToken: apiToken
  })

  const tickets: JiraTicket[] = []
  const batchSize = 5
  
  for (let i = 0; i < ticketKeys.length; i += batchSize) {
    const batch = ticketKeys.slice(i, i + batchSize)
    const batchPromises = batch.map(async (key) => {
      try {
        const ticket = await apiService.getIssue(key)
        if (ticket) {
          console.log(`✅ Background: Fetched details for ${key}`)
          return ticket
        }
        console.warn(`⚠️ Background: No details found for ${key}`)
        return null
      } catch (error) {
        console.error(`❌ Background: Failed to fetch ${key}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    tickets.push(...batchResults.filter(Boolean))
    
    // Rate limiting between batches
    if (i + batchSize < ticketKeys.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`🎉 Background: Successfully fetched ${tickets.length}/${ticketKeys.length} tickets`)
  return tickets
}
