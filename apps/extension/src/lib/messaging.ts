/**
 * Centralized messaging service for the entire extension
 * Single source of truth for all @webext-core/messaging communication
 */

import { defineExtensionMessaging } from '@webext-core/messaging'
import { OAuthTokens } from './storage'

/**
 * Single defineExtensionMessaging call for the entire extension
 * All services should import sendMessage/onMessage from this file
 */
export const { sendMessage, onMessage } = defineExtensionMessaging<{
  OAUTH_TOKEN_RECEIVED(tokens: OAuthTokens): {
    success: boolean
    error?: string
  }
}>()
