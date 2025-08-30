/**
 * Message handlers for ticket-related operations
 */

import { TicketFetcherService } from '../services/ticket-fetcher'

import type {
  MessageRequest,
  MessageResponse,
  MessageHandler
} from './message-router'

/**
 * Handlers for ticket-related messages
 */
export class TicketMessageHandler {
  /**
   * Handles FETCH_TICKET_DETAILS messages
   */
  static handleFetchTicketDetails: MessageHandler = async (
    message: MessageRequest
  ) => {
    try {
      const { ticketKeys } = message

      if (!Array.isArray(ticketKeys)) {
        return {
          success: false,
          error: 'Invalid ticket keys provided'
        }
      }

      if (ticketKeys.length === 0) {
        return {
          success: true,
          data: { tickets: [] }
        }
      }

      console.log(
        `🎫 Processing request for ${ticketKeys.length} tickets:`,
        ticketKeys
      )

      const tickets = await TicketFetcherService.fetchTicketDetails(ticketKeys)

      return {
        success: true,
        data: { tickets }
      }
    } catch (error) {
      console.error('❌ Failed to fetch ticket details:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Handles TEST_API_CONNECTION messages
   */
  static handleTestConnection: MessageHandler = async () => {
    try {
      console.log('🧪 Testing API connection...')

      const result = await TicketFetcherService.testConnection()

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('❌ API connection test failed:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Handles GET_TICKET_DETAILS messages for single tickets
   */
  static handleGetSingleTicket: MessageHandler = async (
    message: MessageRequest
  ) => {
    try {
      const { ticketKey } = message

      if (!ticketKey || typeof ticketKey !== 'string') {
        return {
          success: false,
          error: 'Invalid ticket key provided'
        }
      }

      console.log(`🎫 Processing request for single ticket: ${ticketKey}`)

      const tickets = await TicketFetcherService.fetchTicketDetails([ticketKey])
      const ticket = tickets.length > 0 ? tickets[0] : null

      return {
        success: true,
        data: { ticket }
      }
    } catch (error) {
      console.error('❌ Failed to fetch single ticket:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Handles VALIDATE_TICKET_KEYS messages
   */
  static handleValidateTicketKeys: MessageHandler = async (
    message: MessageRequest
  ) => {
    try {
      const { ticketKeys } = message

      if (!Array.isArray(ticketKeys)) {
        return {
          success: false,
          error: 'Invalid ticket keys provided'
        }
      }

      const ticketKeyPattern = /^[A-Z]+-\d+$/
      const validation = ticketKeys.map((key) => ({
        key,
        isValid: typeof key === 'string' && ticketKeyPattern.test(key.trim())
      }))

      const validKeys = validation.filter((v) => v.isValid).map((v) => v.key)
      const invalidKeys = validation.filter((v) => !v.isValid).map((v) => v.key)

      return {
        success: true,
        data: {
          validKeys,
          invalidKeys,
          totalCount: ticketKeys.length,
          validCount: validKeys.length,
          invalidCount: invalidKeys.length
        }
      }
    } catch (error) {
      console.error('❌ Failed to validate ticket keys:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }
    }
  }
}
