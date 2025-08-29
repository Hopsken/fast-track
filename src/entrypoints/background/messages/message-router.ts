/**
 * Message routing system for background script
 */

import { browser } from '#imports'
import { TicketMessageHandler } from './ticket-messages'

export interface MessageRequest {
  type: string
  [key: string]: any
}

export interface MessageResponse {
  success: boolean
  data?: any
  error?: string
}

export type MessageHandler = (
  message: MessageRequest,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse>

/**
 * Central message router for background script
 */
export class MessageRouter {
  private static handlers = new Map<string, MessageHandler>()

  /**
   * Initializes the message routing system
   */
  static initialize(): void {
    // Register message handlers
    this.registerHandler('FETCH_TICKET_DETAILS', TicketMessageHandler.handleFetchTicketDetails)
    this.registerHandler('TEST_API_CONNECTION', TicketMessageHandler.handleTestConnection)
    
    // Set up main message listener
    browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    
    console.log('📮 Message router initialized with', this.handlers.size, 'handlers')
  }

  /**
   * Registers a message handler for a specific message type
   */
  static registerHandler(messageType: string, handler: MessageHandler): void {
    this.handlers.set(messageType, handler)
    console.log(`📝 Registered handler for message type: ${messageType}`)
  }

  /**
   * Unregisters a message handler
   */
  static unregisterHandler(messageType: string): void {
    this.handlers.delete(messageType)
    console.log(`🗑️ Unregistered handler for message type: ${messageType}`)
  }

  /**
   * Main message handler that routes messages to appropriate handlers
   */
  private static async handleMessage(
    message: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): Promise<boolean> {
    console.log('📨 Background: Received message:', message.type, 'from', sender.tab?.url)

    try {
      const handler = this.handlers.get(message.type)
      
      if (!handler) {
        console.warn(`⚠️ No handler found for message type: ${message.type}`)
        sendResponse({
          success: false,
          error: `Unknown message type: ${message.type}`
        })
        return false
      }

      // Execute handler
      const response = await handler(message, sender)
      sendResponse(response)
      
      console.log('✅ Background: Message handled successfully:', message.type)
      return true
    } catch (error) {
      console.error('❌ Background: Message handling failed:', error)
      
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      return false
    }
  }

  /**
   * Sends a message to a specific tab
   */
  static async sendMessageToTab<T = any>(
    tabId: number, 
    message: MessageRequest
  ): Promise<T | null> {
    try {
      const response = await browser.tabs.sendMessage(tabId, message)
      return response
    } catch (error) {
      console.error(`Failed to send message to tab ${tabId}:`, error)
      return null
    }
  }

  /**
   * Broadcasts a message to all tabs
   */
  static async broadcastMessage(message: MessageRequest): Promise<void> {
    try {
      const tabs = await browser.tabs.query({})
      
      const promises = tabs.map(tab => {
        if (tab.id) {
          return this.sendMessageToTab(tab.id, message).catch(() => {
            // Ignore errors for tabs that can't receive messages
          })
        }
      })

      await Promise.all(promises)
      console.log(`📡 Broadcasted message ${message.type} to ${tabs.length} tabs`)
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error)
    }
  }

  /**
   * Gets all registered message types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Gets statistics about message handling
   */
  static getStats(): { totalHandlers: number; registeredTypes: string[] } {
    return {
      totalHandlers: this.handlers.size,
      registeredTypes: this.getRegisteredTypes()
    }
  }
}