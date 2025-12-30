/**
 * Background service for omnibox (address bar) functionality
 */

import { Browser, browser } from '#imports'
import { escape } from 'lodash-es'

import { getTicketService } from '@/services/ticket-service'
import { JiraTicket } from '@/types'
import { isTicketKey } from '@/utils/jira/issues'
import { getLogger } from '~/utils/logger'
import { openJiraIssue, openJiraSearch } from '~/utils/open-jira-issue'
import { rankTickets } from '~/utils/ticket-ranking'

const MAX_SUGGESTIONS = 5
const MIN_QUERY_LENGTH = 2
const normalizeTicketKey = (value: string) => value.trim().toUpperCase()

export class OmniboxHandlerService {
  private static latestRequestId = 0
  private static log = getLogger('omnibox')

  static initialize(): void {
    browser.omnibox.onInputEntered.addListener(
      this.handleOmniboxInput.bind(this)
    )

    if (browser.omnibox.onInputChanged) {
      browser.omnibox.onInputChanged.addListener(
        this.handleOmniboxInputChanged.bind(this)
      )
    }
  }

  /**
   * Handles omnibox input when user presses Enter
   */
  private static async handleOmniboxInput(text: string): Promise<void> {
    const query = text.trim()
    if (!query) return

    try {
      if (isTicketKey(query)) {
        await openJiraIssue(query)
        return
      }

      await openJiraSearch(query)
    } catch (error) {
      this.log.error('❌ Omnibox: Failed to handle input', error)
    }
  }

  /**
   * Handles omnibox input changes for providing suggestions
   */
  private static async handleOmniboxInputChanged(
    text: string,
    suggest: (suggestions: Browser.omnibox.SuggestResult[]) => void
  ): Promise<void> {
    const query = text.trim()

    if (query.length < MIN_QUERY_LENGTH) {
      suggest([])
      return
    }

    const requestId = ++this.latestRequestId

    const emitSuggestions = (tickets: JiraTicket[]) => {
      if (requestId !== this.latestRequestId) return
      suggest(this.buildSuggestions(tickets, query))
    }

    this.searchRemoteTickets(query)
      .then((tickets) => {
        emitSuggestions(tickets)
      })
      .catch((error) => {
        this.log.error('❌ Omnibox: Remote suggestion failed', error)
      })
  }

  /**
   * Builds suggestions from tickets plus direct key entry
   */
  private static buildSuggestions(
    tickets: JiraTicket[],
    text: string
  ): Browser.omnibox.SuggestResult[] {
    const normalized = text.trim()
    const normalizedKey = normalizeTicketKey(normalized)

    const rankedTickets = rankTickets(tickets, normalized, MAX_SUGGESTIONS)

    const suggestions: Browser.omnibox.SuggestResult[] = rankedTickets.map(
      (ticket) => this.toSuggestion(ticket)
    )

    if (
      isTicketKey(normalized) &&
      !rankedTickets.some((ticket) => ticket.key === normalizedKey)
    ) {
      suggestions.unshift({
        content: normalizedKey,
        description: `Open ticket: <match>${normalizedKey}</match>`
      })
    }

    return suggestions.slice(0, MAX_SUGGESTIONS)
  }

  /**
   * Sets the default suggestion text
   */
  static setDefaultSuggestion(description: string): void {
    if (browser.omnibox.setDefaultSuggestion) {
      browser.omnibox.setDefaultSuggestion({ description })
    }
  }

  private static async searchRemoteTickets(query: string) {
    const ticketService = getTicketService()
    const tickets = await ticketService.searchTickets(query)
    return tickets
  }

  private static toSuggestion(
    ticket: JiraTicket
  ): Browser.omnibox.SuggestResult {
    const key = escape(ticket.key)
    const summary = escape(ticket.summary)

    return {
      content: ticket.key,
      description: `<match>${key}</match> - <dim>${summary}</dim>`
    }
  }
}
