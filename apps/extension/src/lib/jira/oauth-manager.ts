import { getStorageItem } from '@/lib/storage'
import ky from 'ky'
import loglevel from 'loglevel'

import {
  type OAuthTokens,
  type OAuthUserInfo,
  type AuthType
} from '../storage/schema'
import { browser } from '#imports'
import z from 'zod'

const log = loglevel.getLogger('OAuthTokenManager')

const oauthTokensSchema = z.object({
  refresh_token: z.string(),
  access_token: z.string(),
  expires_at: z.iso.datetime()
})

/**
 * OAuth message types for communication between website and extension
 */
export interface OAuthMessage {
  type: 'JIRA_OAUTH_SUCCESS' | 'JIRA_OAUTH_ERROR'
  data: OAuthSuccessData | OAuthErrorData
  origin: string
}

export interface OAuthSuccessData {
  refresh_token: string
  access_token: string
  expires_at: string // ISO timestamp
  user_info: {
    account_id: string
    email: string
    display_name: string
    avatar_url?: string
  }
}

export interface OAuthErrorData {
  error: string
  error_description?: string
}

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

const authApi = ky.extend({
  prefixUrl: 'https://auth.atlassian.com',
  timeout: 10000
})

/**
 * Unified OAuth Manager for Jira authentication
 * Handles token storage, encryption, refresh, communication, and flow management
 */
export class OAuthTokenManager {
  private static instance: OAuthTokenManager

  private constructor() {}

  static getInstance(): OAuthTokenManager {
    if (!OAuthTokenManager.instance) {
      OAuthTokenManager.instance = new OAuthTokenManager()
    }
    return OAuthTokenManager.instance
  }

  // ========================================
  // TOKEN MANAGEMENT METHODS
  // ========================================

  /**
   * Store OAuth tokens securely
   */
  async storeTokens(tokens: OAuthTokens): Promise<void> {
    try {
      await getStorageItem('OAuthTokens').setValue(tokens)
      await getStorageItem('AuthType').setValue('oauth')
    } catch (error) {
      console.error('Failed to store OAuth tokens:', error)
      throw new Error('Token storage failed')
    }
  }

  /**
   * Retrieve and decrypt OAuth tokens
   */
  async getTokens(): Promise<OAuthTokens | null> {
    return getStorageItem('OAuthTokens').getValue()
  }

  /**
   * Check if access token is expired
   */
  async isTokenExpired(): Promise<boolean> {
    const tokens = await this.getTokens()
    if (!tokens) return true

    const expiresAt = new Date(tokens.expires_at)
    const now = new Date()
    // Consider token expired 5 minutes before actual expiration
    const bufferTime = 5 * 60 * 1000

    return now.getTime() >= expiresAt.getTime() - bufferTime
  }

  /**
   * Refresh OAuth tokens using refresh token
   */
  async refreshTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens()
      if (!tokens?.refresh_token) {
        throw new Error('No refresh token available')
      }

      const clientId = import.meta.env.VITE_JIRA_CLIENT_ID
      if (!clientId) {
        throw new Error(
          'OAuth client ID not configured in environment variables'
        )
      }

      const refreshResponse = await authApi.post<{
        access_token: string
        refresh_token: string
        expires_in: number // in seconds
      }>('oauth/token', {
        json: {
          grant_type: 'refresh_token',
          client_id: clientId,
          refresh_token: tokens.refresh_token
        }
      })

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshResponse.status}`)
      }

      const newTokens = await refreshResponse.json()
      await this.storeTokens({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: new Date(
          Date.now() + newTokens.expires_in * 1000
        ).toISOString()
      })

      return true
    } catch (error) {
      console.error('Failed to refresh OAuth tokens:', error)
      await this.clearTokens()
      return false
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      if (await this.isTokenExpired()) {
        const refreshed = await this.refreshTokens()
        if (!refreshed) return null
      }

      const tokens = await this.getTokens()
      return tokens?.access_token || null
    } catch (error) {
      console.error('Failed to get valid access token:', error)
      return null
    }
  }

  /**
   * Store user information
   */
  async storeUserInfo(userInfo: OAuthUserInfo): Promise<void> {
    await getStorageItem('OAuthUserInfo').setValue(userInfo)
  }

  /**
   * Get stored user information
   */
  async getUserInfo(): Promise<OAuthUserInfo | null> {
    return await getStorageItem('OAuthUserInfo').getValue()
  }

  /**
   * Check if OAuth is configured and active
   */
  async isOAuthActive(): Promise<boolean> {
    const authType = await getStorageItem('AuthType').getValue()
    const tokens = await this.getTokens()
    return authType === 'oauth' && tokens !== null
  }

  /**
   * Clear all OAuth data
   */
  async clearTokens(): Promise<void> {
    await getStorageItem('OAuthTokens').setValue(null)
    await getStorageItem('OAuthUserInfo').setValue(null)
    await getStorageItem('AuthType').setValue('oauth')
  }

  /**
   * Get authentication type
   */
  async getAuthType(): Promise<AuthType> {
    return (await getStorageItem('AuthType').getValue()) || 'oauth'
  }

  /**
   * Set authentication type
   */
  async setAuthType(type: AuthType): Promise<void> {
    await getStorageItem('AuthType').setValue(type)
  }

  /**
   * Initiate OAuth flow
   * Opens the website OAuth page with the extension ID
   */
  initiateFlow() {
    const currentExtensionId = browser.runtime.id

    // Use local development URL in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    const baseUrl = isDevelopment
      ? 'http://localhost:4000'
      : 'https://jiraboost.com'

    const oauthUrl = `${baseUrl}/auth/jira?extension_id=${encodeURIComponent(currentExtensionId)}`
    window.open(oauthUrl, '_blank')
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
        ? this.isTokenExpiredByDate(tokens.expires_at)
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
   * Check if token is expired by date
   */
  private isTokenExpiredByDate(expiresAt: string): boolean {
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
   * Clear OAuth data and sign out
   */
  async signOut(): Promise<OAuthFlowResult> {
    try {
      await this.clearTokens()
      await this.setAuthType('oauth')

      const status = await this.getStatus()

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

  async validateAndSaveTokens(tokens: OAuthTokens): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Validate tokens
      const parsedTokens = oauthTokensSchema.parse(tokens)

      const resources = await this.getAccessibleResources(parsedTokens)

      log.debug('Accessible resources:', resources)

      await this.setAuthType('oauth')
      await this.storeTokens(parsedTokens)

      return {
        success: true
      }
    } catch (error) {
      console.error('Error validating and saving tokens:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAccessibleResources(token: OAuthTokens) {
    type AccessibleResource = {
      name: string
      url: string
      scopes: string[]
      avatarUrl: string
    }

    const response = await ky.get<AccessibleResource[]>(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      }
    )
    return response.json()
  }
}

export const oauthManager = OAuthTokenManager.getInstance()
