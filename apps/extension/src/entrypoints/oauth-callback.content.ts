import { defineContentScript } from '#imports'
import loglevel from 'loglevel'
import { z } from 'zod'

import { getAuthService } from '@/services/auth-service'
import { ReceivedTokenPayload } from '@/types'

const log = loglevel.getLogger('OAuthCallbackContentScript')
const allowedOrigins = ['https://teamusement.com', 'http://localhost:4000']

interface TokenEventData {
  source: 'page'
  tokenData: ReceivedTokenPayload
}

interface ConfirmationEventData {
  source: 'content_script'
  success: boolean
  message?: string
  error?: string
}

declare global {
  interface WindowEventMap {
    'jira-oauth-tokens': CustomEvent<TokenEventData>
    'jira-oauth-confirmation': CustomEvent<ConfirmationEventData>
  }
}

/**
 * Content script for secure OAuth callback communication
 * Runs only on the OAuth callback page to handle secure token exchange
 */
export default defineContentScript({
  matches: [
    'https://teamusement.com/auth/jira/callback*',
    'http://localhost/*'
  ],
  runAt: 'document_start',
  main() {
    log.debug('Loaded on callback page')

    // Initialize secure OAuth communication
    initializeSecureOAuthCommunication()
  }
})

function validateEvent(event: CustomEvent, schema: z.ZodType) {
  try {
    schema.parse(event.detail)
  } catch (error) {
    log.error('Invalid event data:', error)
    throw error
  }
}

/**
 * Initialize secure OAuth communication for the callback page
 */
function initializeSecureOAuthCommunication(): void {
  const authService = getAuthService()

  // Listen for custom events from the page script
  const handleOAuthTokensEvent = async (event: CustomEvent<TokenEventData>) => {
    try {
      // Validate event data structure
      validateEvent(
        event,
        z.object({
          source: z.literal('page'),
          tokenData: z.object({
            access_token: z.string(),
            refresh_token: z.string(),
            expires_at: z.iso.datetime()
          })
        })
      )

      // Validate origin (check if we're on an allowed domain)
      const currentOrigin = window.location.origin
      if (!allowedOrigins.includes(currentOrigin)) {
        return
      }

      const { tokenData } = event.detail
      log.debug('Processing token data:', tokenData)

      await authService.receiveTokens(tokenData)

      const confirmationEvent = new CustomEvent<ConfirmationEventData>(
        'jira-oauth-confirmation',
        {
          detail: {
            source: 'content_script',
            success: true,
            message: 'Tokens received and forwarded successfully'
          }
        }
      )
      window.dispatchEvent(confirmationEvent)
      log.debug('Dispatched success confirmation event')
    } catch (error) {
      log.error('Error handling token event:', error)

      // Dispatch error confirmation event
      const errorEvent = new CustomEvent('jira-oauth-confirmation', {
        detail: {
          source: 'content_script',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      window.dispatchEvent(errorEvent)
    }
  }

  window.addEventListener('jira-oauth-tokens', handleOAuthTokensEvent)
}
