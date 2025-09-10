/**
 * Utility functions for managing Chrome extension shortcuts
 */

export interface ExtensionCommand {
  name?: string
  description?: string
  shortcut?: string
}

/**
 * Get the current keyboard shortcut for opening the extension
 */
export async function getCurrentShortcut(): Promise<string> {
  try {
    if (typeof chrome !== 'undefined' && chrome.commands) {
      const commands = await chrome.commands.getAll()
      const executeAction = commands.find(
        (cmd) => cmd.name === '_execute_action'
      )
      return executeAction?.shortcut || 'Alt+J'
    }
    return 'Alt+J'
  } catch (error) {
    console.warn('Failed to get current shortcut:', error)
    return 'Alt+J'
  }
}

/**
 * Open Chrome's extension shortcuts page where users can customize shortcuts
 */
export function openShortcutsPage(): void {
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({
        url: 'chrome://extensions/shortcuts'
      })
    } else {
      // Fallback for development or other browsers
      window.open('chrome://extensions/shortcuts', '_blank')
    }
  } catch (error) {
    console.warn('Failed to open shortcuts page:', error)
  }
}

/**
 * Format a shortcut string for display
 */
export function formatShortcut(shortcut: string): string {
  if (!shortcut) return 'Not set'

  return shortcut
    .split('+')
    .map((key) => {
      switch (key.toLowerCase()) {
        case 'ctrl':
          return 'Ctrl'
        case 'alt':
          return 'Alt'
        case 'shift':
          return 'Shift'
        case 'cmd':
          return 'Cmd'
        case 'meta':
          return navigator.userAgent.includes('Mac') ? 'Cmd' : 'Meta'
        default:
          return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
      }
    })
    .join(' + ')
}
