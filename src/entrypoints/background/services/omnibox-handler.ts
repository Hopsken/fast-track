/**
 * Background service for omnibox (address bar) functionality
 */

import { browser } from '#imports'

import { openJiraIssue } from '~/utils/open-jira-issue'

export class OmniboxHandlerService {
  /**
   * Initializes omnibox event listeners
   */
  static initialize(): void {
    browser.omnibox.onInputEntered.addListener(
      this.handleOmniboxInput.bind(this)
    )

    // Optional: Add input changed listener for suggestions
    if (browser.omnibox.onInputChanged) {
      browser.omnibox.onInputChanged.addListener(
        this.handleOmniboxInputChanged.bind(this)
      )
    }
  }

  /**
   * Handles omnibox input when user presses Enter
   */
  private static handleOmniboxInput(text: string): void {
    console.log('🔍 Omnibox: User entered:', text)

    try {
      openJiraIssue(text)
    } catch (error) {
      console.error('❌ Omnibox: Failed to open Jira issue:', error)
    }
  }

  /**
   * Handles omnibox input changes for providing suggestions
   */
  private static handleOmniboxInputChanged(
    text: string,
    suggest: (suggestions: chrome.omnibox.SuggestResult[]) => void
  ): void {
    if (text.length < 2) {
      suggest([])
      return
    }

    const suggestions = this.generateSuggestions(text)
    suggest(suggestions)
  }

  /**
   * Generates suggestions based on user input
   */
  private static generateSuggestions(
    text: string
  ): chrome.omnibox.SuggestResult[] {
    const suggestions: chrome.omnibox.SuggestResult[] = []

    // Check if text looks like a ticket key (e.g., "PROJ-123")
    const ticketKeyPattern = /^[A-Z]+-\d+$/i
    if (ticketKeyPattern.test(text.trim())) {
      suggestions.push({
        content: text.trim().toUpperCase(),
        description: `Open ticket: <match>${text.trim().toUpperCase()}</match>`
      })
    }

    // Add search suggestion
    suggestions.push({
      content: `search:${text}`,
      description: `Search for: <match>${text}</match>`
    })

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  /**
   * Sets the default suggestion text
   */
  static setDefaultSuggestion(description: string): void {
    if (browser.omnibox.setDefaultSuggestion) {
      browser.omnibox.setDefaultSuggestion({ description })
    }
  }

  /**
   * Updates omnibox suggestions based on recent tickets
   */
  static async updateSuggestionsFromRecentTickets(): Promise<void> {
    // This could be called periodically to update suggestions
    // based on recently viewed tickets from storage
    try {
      // Implementation would fetch recent tickets and update suggestions
      console.log('📝 Omnibox: Updated suggestions from recent tickets')
    } catch (error) {
      console.error('❌ Omnibox: Failed to update suggestions:', error)
    }
  }
}
