/**
 * OAuth Flow Utilities
 * Provides easy-to-use functions for initiating and managing OAuth flow from extension
 */

import { getStorageItem } from '@/lib/storage'
import { oauthManager } from './oauth-manager'

/**
 * OAuth flow status
 */
export interface OAuthFlowStatus {
  isAuthenticated: boolean
  authType: string | null
  hasTokens: boolean
  tokenExpiry?: string
  userInfo?: {
    account_id: string
    email: string
    display_name: string
    avatar_url?: string
  }
  isTokenExpired?: boolean
}

/**
 * OAuth flow result
 */
export interface OAuthFlowResult {
  success: boolean
  error?: string
  status?: OAuthFlowStatus
}

/**
 * OAuth Flow Manager
 * Handles OAuth flow initiation and status management
 */
export class OAuthFlow {
  private static instance: OAuthFlow
  private listeners: Set<(status: OAuthFlowStatus) => void> = new Set()

  private constructor() {
    this.setupEventListeners()
  }

  public static getInstance(): OAuthFlow {
    if (!OAuthFlow.instance) {
      OAuthFlow.instance = new OAuthFlow()
    }
    return OAuthFlow.instance
  }

  /**
   * Setup event listeners for OAuth status changes
   */
  private setupEventListeners(): void {
    // Listen for OAuth success/error events
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'oauth-success',
        this.handleOAuthSuccess.bind(this) as unknown as EventListener
      )
      window.addEventListener(
        'oauth-error',
        this.handleOAuthError.bind(this) as unknown as EventListener
      )
    }
  }

  /**
   * Handle OAuth success event
   */
  private async handleOAuthSuccess(): Promise<void> {
    const status = await this.getStatus()
    this.notifyListeners(status)
  }

  /**
   * Handle OAuth error event
   */
  private async handleOAuthError(event: CustomEvent): Promise<void> {
    console.error('OAuth flow error:', event.detail?.error)
    const status = await this.getStatus()
    this.notifyListeners(status)
  }

  /**
   * Notify all listeners about status changes
   */
  private notifyListeners(status: OAuthFlowStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in OAuth status listener:', error)
      }
    })
  }

  /**
   * Initiate OAuth flow (alias for initiateFlow)
   */
  async initiate(): Promise<OAuthFlowResult> {
    return this.initiateFlow()
  }

  /**
   * Initiate OAuth flow
   * Opens the website OAuth page with the extension ID
   */
  async initiateFlow(): Promise<OAuthFlowResult> {
    try {
      // Send message to background script to initiate OAuth
      const response = await chrome.runtime.sendMessage({
        type: 'OAUTH_INITIATE',
        extensionId: chrome.runtime.id
      })

      return response?.success
        ? {
            success: true,
            status: await this.getStatus()
          }
        : {
            success: false,
            error: response?.error || 'Failed to initiate OAuth flow'
          }
    } catch (error) {
      console.error('Error initiating OAuth flow:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get current OAuth status
   */
  async getStatus(): Promise<OAuthFlowStatus> {
    try {
      // Try to get status from background script first
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'OAUTH_STATUS'
        })

        if (response && typeof response === 'object') {
          return response as OAuthFlowStatus
        }
      } catch (error) {
        console.warn(
          'Could not get status from background script, checking locally:',
          error
        )
      }

      // Fallback to local storage check
      const authType = await getStorageItem('AuthType').getValue()
      const tokens = await getStorageItem('OAuthTokens').getValue()
      const userInfo = await getStorageItem('OAuthUserInfo').getValue()

      const isTokenExpired = tokens
        ? this.isTokenExpired(tokens.expires_at)
        : false

      return {
        isAuthenticated: authType === 'oauth' && !!tokens && !isTokenExpired,
        authType,
        hasTokens: !!tokens,
        tokenExpiry: tokens?.expires_at,
        userInfo: userInfo || undefined,
        isTokenExpired
      }
    } catch (error) {
      console.error('Error getting OAuth status:', error)
      return {
        isAuthenticated: false,
        authType: null,
        hasTokens: false
      }
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(expiresAt: string): boolean {
    try {
      const expiry = new Date(expiresAt).getTime()
      const now = Date.now()
      const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

      return now >= expiry - bufferTime
    } catch (error) {
      console.error('Error checking token expiry:', error)
      return true // Assume expired if we can't parse
    }
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(): Promise<OAuthFlowResult> {
    try {
      const success = await oauthManager.refreshTokens()

      if (success) {
        const status = await this.getStatus()
        this.notifyListeners(status)

        return {
          success: true,
          status
        }
      } else {
        return {
          success: false,
          error: 'Token refresh failed'
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clear OAuth data and sign out
   */
  async signOut(): Promise<OAuthFlowResult> {
    try {
      await oauthManager.clearTokens()
      await oauthManager.setAuthType(null)

      const status = await this.getStatus()
      this.notifyListeners(status)

      return {
        success: true,
        status
      }
    } catch (error) {
      console.error('Error signing out:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if user needs to migrate from API key to OAuth
   */
  async needsMigration(): Promise<boolean> {
    try {
      const authType = await getStorageItem('AuthType').getValue()
      const jiraHost = await getStorageItem('JiraHost').getValue()
      const jiraApiToken = await getStorageItem('JiraApiToken').getValue()
      const jiraUserEmail = await getStorageItem('JiraUserEmail').getValue()
      const settings = await getStorageItem('OAuthSettings').getValue()

      const apiConfig = {
        host: jiraHost,
        apiToken: jiraApiToken,
        userEmail: jiraUserEmail
      }

      // User needs migration if:
      // 1. Currently using API key auth
      // 2. Has API config
      // 3. Migration not completed
      return (
        authType === 'api_key' && !!apiConfig && !settings?.migration_completed
      )
    } catch (error) {
      console.error('Error checking migration status:', error)
      return false
    }
  }

  /**
   * Add status change listener
   */
  addStatusListener(listener: (status: OAuthFlowStatus) => void): void {
    this.listeners.add(listener)
  }

  /**
   * Remove status change listener
   */
  removeStatusListener(listener: (status: OAuthFlowStatus) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * Get OAuth URL for manual opening (useful for development/testing)
   */
  getOAuthUrl(extensionId?: string): string {
    const id = extensionId || chrome.runtime.id
    return `https://jira-boost.com/auth/jira?extension_id=${encodeURIComponent(id)}`
  }

  /**
   * Get development OAuth URL (for local testing)
   */
  getDevOAuthUrl(extensionId?: string, port: number = 3000): string {
    const id = extensionId || chrome.runtime.id
    return `http://localhost:${port}/auth/jira?extension_id=${encodeURIComponent(id)}`
  }
}

// Export singleton instance
export const oauthFlow = OAuthFlow.getInstance()

// Export utility functions for easier usage
export const OAuth = {
  /**
   * Start OAuth flow
   */
  async start(): Promise<OAuthFlowResult> {
    return oauthFlow.initiateFlow()
  },

  /**
   * Get current status
   */
  async getStatus(): Promise<OAuthFlowStatus> {
    return oauthFlow.getStatus()
  },

  /**
   * Refresh token
   */
  async refresh(): Promise<OAuthFlowResult> {
    return oauthFlow.refreshToken()
  },

  /**
   * Sign out
   */
  async signOut(): Promise<OAuthFlowResult> {
    return oauthFlow.signOut()
  },

  /**
   * Check if migration is needed
   */
  async needsMigration(): Promise<boolean> {
    return oauthFlow.needsMigration()
  },

  /**
   * Add status listener
   */
  onStatusChange(listener: (status: OAuthFlowStatus) => void): () => void {
    oauthFlow.addStatusListener(listener)
    // Return cleanup function
    return () => oauthFlow.removeStatusListener(listener)
  }
}
