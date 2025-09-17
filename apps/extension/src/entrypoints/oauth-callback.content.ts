import { defineContentScript } from '#imports'

import { oauthCommunication } from '@/lib/jira/oauth-communication'

/**
 * Content script for secure OAuth callback communication
 * Runs only on the OAuth callback page to handle secure token exchange
 */

// Custom event interfaces for type safety
interface TokenEventData {
  id: string
  timestamp: number
  source: 'page'
  tokenData: {
    access_token: string
    refresh_token: string
    [key: string]: any
  }
}

interface ConfirmationEventData {
  id: string
  timestamp: number
  source: 'content_script'
  success: boolean
  message?: string
  error?: string
}

// Utility functions
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Removed generateRequestId - no longer needed for custom events
export default defineContentScript({
  matches: [
    'https://jiraboost.com/auth/jira/callback*',
    'http://localhost:4000/auth/jira/callback*',
    'http://localhost:3000/auth/jira/callback*'
  ],
  runAt: 'document_start',
  main() {
    console.log('OAuth Content Script: Loaded on callback page')

    // Initialize secure OAuth communication
    initializeSecureOAuthCommunication()
  }
})

/**
 * Initialize secure OAuth communication for the callback page
 */
function initializeSecureOAuthCommunication(): void {
  // Allowed origins for OAuth communication
  const allowedOrigins = [
    'https://jiraboost.com',
    'https://www.jiraboost.com',
    'http://localhost:3000',
    'http://localhost:4000'
  ]

  // Custom event-based communication - no request tracking needed

  // Listen for custom events from the page script
  const handleOAuthTokensEvent = async (event: CustomEvent) => {
    console.log('OAuth Content Script: Received custom event:', event.detail)
    try {
      // Validate event data structure
      if (!event.detail || typeof event.detail !== 'object') {
        console.warn('OAuth Content Script: Invalid event data structure')
        return
      }

      // Validate origin (check if we're on an allowed domain)
      const currentOrigin = window.location.origin
      if (!allowedOrigins.includes(currentOrigin)) {
        console.warn('OAuth Content Script: Invalid origin:', currentOrigin)
        return
      }

      // Validate event data
      const eventData = event.detail
      if (
        !eventData.timestamp ||
        !eventData.source ||
        eventData.source !== 'page'
      ) {
        console.warn('OAuth Content Script: Invalid event data:', eventData)
        return
      }

      // Validate token data structure
      if (!eventData.tokenData) {
        console.error('OAuth Content Script: No token data in event')
        return
      }

      const { tokenData } = eventData
      if (!tokenData.access_token || !tokenData.refresh_token) {
        console.error(
          'OAuth Content Script: Invalid token data structure:',
          tokenData
        )
        return
      }

      console.log('OAuth Content Script: Processing token data:', tokenData)

      // Forward tokens to background script
      await chrome.runtime.sendMessage({
        type: 'OAUTH_TOKEN_RECEIVED',
        payload: {
          type: 'JIRA_OAUTH_SUCCESS',
          data: tokenData,
          origin: window.location.origin
        }
      })

      console.log(
        'OAuth Content Script: Tokens successfully forwarded to background'
      )

      // Dispatch success confirmation event
      const confirmationEvent = new CustomEvent('jira-oauth-confirmation', {
        detail: {
          id: generateMessageId(),
          timestamp: Date.now(),
          source: 'content_script',
          success: true,
          message: 'Tokens received and forwarded successfully'
        }
      })

      window.dispatchEvent(confirmationEvent)
      console.log('OAuth Content Script: Dispatched success confirmation event')
    } catch (error) {
      console.error('OAuth Content Script: Error handling token event:', error)

      // Dispatch error confirmation event
      const errorEvent = new CustomEvent('jira-oauth-confirmation', {
        detail: {
          id: generateMessageId(),
          timestamp: Date.now(),
          source: 'content_script',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      window.dispatchEvent(errorEvent)
    }
  }

  // Add event listener for custom token events
  window.addEventListener(
    'jira-oauth-tokens',
    handleOAuthTokensEvent as EventListener
  )

  console.log('OAuth Content Script: Custom event communication initialized')
  console.log('OAuth Content Script: Waiting for token event from page...')
}

// Content script now uses custom events:
// 1. Page dispatches 'jira-oauth-tokens' custom event with token data
// 2. Content script receives event and forwards tokens to background
// 3. Content script dispatches 'jira-oauth-confirmation' event with result
