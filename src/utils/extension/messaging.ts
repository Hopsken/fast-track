/**
 * Extension message passing utilities
 */

import { browser } from '#imports'

export interface ExtensionMessage {
  type: string
  [key: string]: unknown
}

export interface ExtensionResponse {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Sends a message to the background script
 */
export async function sendToBackground<T = unknown>(
  message: ExtensionMessage
): Promise<T> {
  try {
    const response = await browser.runtime.sendMessage(message)

    if (!response.success) {
      throw new Error(response.error || 'Background request failed')
    }

    return response.data
  } catch (error) {
    console.error('Failed to send message to background:', error)
    throw error
  }
}

/**
 * Sends a message to a specific tab
 */
export async function sendToTab<T = unknown>(
  tabId: number,
  message: ExtensionMessage
): Promise<T> {
  try {
    return await browser.tabs.sendMessage(tabId, message)
  } catch (error) {
    console.error(`Failed to send message to tab ${tabId}:`, error)
    throw error
  }
}

/**
 * Gets the current active tab
 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    return tabs[0] || null
  } catch (error) {
    console.error('Failed to get current tab:', error)
    return null
  }
}

/**
 * Sends a message to the current active tab
 */
export async function sendToCurrentTab<T = unknown>(
  message: ExtensionMessage
): Promise<T | null> {
  const tab = await getCurrentTab()
  if (!tab?.id) return null

  return sendToTab(tab.id, message)
}

/**
 * Creates a message listener for content scripts
 */
export function createMessageListener(
  messageType: string,
  handler: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ) => Promise<unknown> | unknown
) {
  const listener = async (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    if (message.type === messageType) {
      try {
        const result = await handler(message, sender)
        sendResponse({ success: true, data: result })
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      return true // Keep message channel open for async response
    }
  }

  browser.runtime.onMessage.addListener(listener)
  return () => browser.runtime.onMessage.removeListener(listener)
}

/**
 * Typed message senders for specific operations
 */
export const Messages = {
  fetchTicketDetails: (ticketKeys: string[]) =>
    sendToBackground<{ tickets: unknown[] }>({
      type: 'FETCH_TICKET_DETAILS',
      ticketKeys
    }),

  testApiConnection: () =>
    sendToBackground<{ success: boolean; error?: string; user?: unknown }>({
      type: 'TEST_API_CONNECTION'
    })
} as const
