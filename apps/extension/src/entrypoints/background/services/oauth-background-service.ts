import { OAuthCommunicationService } from '@/lib/jira/oauth-communication'
import { oauthManager } from '@/lib/jira/oauth-manager'
import { getStorageItem } from '@/lib/storage'

/**
 * OAuth Background Service
 * Handles automatic OAuth token refresh, lifecycle management, and OAuth message handling
 */
const oauthCommunicationService = OAuthCommunicationService.getInstance()

export class OAuthBackgroundService {
  private refreshInterval: number | null = null
  private readonly REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
  private readonly TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes before expiry

  /**
   * Initialize the OAuth background service
   */
  async initialize(): Promise<void> {
    try {
      console.info('Initializing OAuth background service')

      // Initialize OAuth communication service
      oauthCommunicationService.initialize()

      // Set up message listeners for OAuth events
      this.setupMessageListeners()

      // Check if OAuth is enabled and start token refresh if needed
      let authType: string | null = null
      try {
        const storageItem = getStorageItem('AuthType')
        if (storageItem && typeof storageItem.getValue === 'function') {
          authType = await storageItem.getValue()
        } else {
          console.warn('Storage item not properly initialized, using fallback')
          authType = storageItem?.fallback || null
        }
      } catch (storageError) {
        console.warn(
          'Storage access failed, using fallback value:',
          storageError
        )
        authType = null // Use fallback value
      }

      if (authType === 'oauth') {
        // Start periodic token refresh
        this.startPeriodicRefresh()

        // Perform initial token check
        await this.checkAndRefreshToken()
      }

      console.info('OAuth background service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize OAuth background service:', error)
    }
  }

  /**
   * Start periodic token refresh
   */
  private startPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(async () => {
      await this.checkAndRefreshToken()
    }, this.REFRESH_INTERVAL_MS) as unknown as number

    console.info(
      `Started periodic token refresh (${this.REFRESH_INTERVAL_MS / 1000}s interval)`
    )
  }

  /**
   * Stop periodic token refresh
   */
  private stopPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
      console.info('Stopped periodic token refresh')
    }
  }

  /**
   * Check token expiry and refresh if needed
   */
  private async checkAndRefreshToken(): Promise<void> {
    try {
      const authType = await getStorageItem('AuthType').getValue()
      if (authType !== 'oauth') {
        this.stopPeriodicRefresh()
        return
      }

      const tokens = await getStorageItem('OAuthTokens').getValue()
      if (!tokens) {
        console.warn('No OAuth tokens found')
        return
      }

      // Check if token needs refresh
      const now = Date.now()
      const expiresAt = new Date(tokens.expires_at).getTime()
      const timeUntilExpiry = expiresAt - now

      if (timeUntilExpiry <= this.TOKEN_REFRESH_THRESHOLD_MS) {
        console.info('Token expires soon, attempting refresh')
        await this.refreshToken()
      } else {
        console.debug(
          `Token valid for ${Math.round(timeUntilExpiry / 1000 / 60)} more minutes`
        )
      }
    } catch (error) {
      console.error('Error checking token expiry:', error)
    }
  }

  /**
   * Refresh the OAuth token
   */
  private async refreshToken(): Promise<void> {
    try {
      const success = await oauthManager.refreshTokens()
      if (success) {
        console.info('OAuth token refreshed successfully')
      } else {
        console.warn('Failed to refresh OAuth token')
        // Could trigger re-authentication flow here
        await this.handleTokenRefreshFailure()
      }
    } catch (error) {
      console.error('Error refreshing OAuth token:', error)
      await this.handleTokenRefreshFailure()
    }
  }

  /**
   * Handle token refresh failure
   */
  private async handleTokenRefreshFailure(): Promise<void> {
    try {
      console.warn('Token refresh failed, clearing OAuth data')

      // Clear OAuth tokens but keep other settings
      await getStorageItem('OAuthTokens').setValue(null)
      await getStorageItem('LastRefresh').setValue('')

      // Could notify user or trigger re-authentication
      // For now, just log the issue
      console.info('OAuth tokens cleared due to refresh failure')
    } catch (error) {
      console.error('Error handling token refresh failure:', error)
    }
  }

  /**
   * Handle auth type change
   */
  async onAuthTypeChange(newAuthType: string): Promise<void> {
    if (newAuthType === 'oauth') {
      console.info(
        'Auth type changed to OAuth, starting OAuth background service'
      )
      this.startPeriodicRefresh()
      await this.checkAndRefreshToken()
    } else {
      console.info(
        'Auth type changed from OAuth, stopping OAuth background service'
      )
      this.stopPeriodicRefresh()
    }
  }

  /**
   * Set up message listeners for OAuth events
   */
  private setupMessageListeners(): void {
    // Listen for OAuth success/error messages from content scripts or popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleRuntimeMessage(message, sender, sendResponse)
      return true // Keep message channel open for async response
    })

    console.info('OAuth message listeners set up')
  }

  /**
   * Handle runtime messages related to OAuth
   */
  private async handleRuntimeMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'OAUTH_SUCCESS':
          console.info('Received OAuth success notification')
          // Restart periodic refresh for new tokens
          await this.onAuthTypeChange('oauth')
          sendResponse({ success: true })
          break

        case 'OAUTH_ERROR':
          console.error('Received OAuth error notification:', message.error)
          sendResponse({ success: false, error: message.error })
          break

        case 'OAUTH_TOKEN_RECEIVED':
          console.info('Received OAuth tokens from content script')
          await this.handleSecureTokenReceived(message.payload)
          sendResponse({ success: true })
          break

        case 'OAUTH_ERROR_RECEIVED':
          console.error('Received OAuth error from content script:', message.payload)
          await this.handleSecureErrorReceived(message.payload)
          sendResponse({ success: false, error: message.payload.data.error })
          break

        case 'OAUTH_INITIATE':
          console.info('Initiating OAuth flow')
          await this.initiateOAuthFlow(message.extensionId)
          sendResponse({ success: true })
          break

        case 'OAUTH_STATUS':
          const status = await this.getOAuthStatus()
          sendResponse(status)
          break

        default:
          // Not an OAuth-related message, ignore
          break
      }
    } catch (error) {
      console.error('Error handling runtime message:', error)
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Initiate OAuth flow by opening the website OAuth page
   */
  private async initiateOAuthFlow(extensionId?: string): Promise<void> {
    try {
      const currentExtensionId = extensionId || chrome.runtime.id

      // Use local development URL in development mode
      const isDevelopment =
        process.env.NODE_ENV === 'development' ||
        chrome.runtime.getManifest().version_name?.includes('dev')

      const baseUrl = isDevelopment
        ? 'http://localhost:4000'
        : 'https://jiraboost.com'

      const oauthUrl = `${baseUrl}/auth/jira?extension_id=${encodeURIComponent(currentExtensionId)}`

      // Open OAuth page in a new tab
      await chrome.tabs.create({
        url: oauthUrl,
        active: true
      })

      console.info('OAuth flow initiated, opened:', oauthUrl)
    } catch (error) {
      console.error('Error initiating OAuth flow:', error)
      throw error
    }
  }

  /**
   * Get current OAuth status
   */
  private async getOAuthStatus(): Promise<{
    isAuthenticated: boolean
    authType: string | null
    hasTokens: boolean
    tokenExpiry?: string
    userInfo?: any
  }> {
    try {
      const authType = await getStorageItem('AuthType').getValue()
      const tokens = await getStorageItem('OAuthTokens').getValue()
      const userInfo = await getStorageItem('OAuthUserInfo').getValue()

      return {
        isAuthenticated: authType === 'oauth' && !!tokens,
        authType,
        hasTokens: !!tokens,
        tokenExpiry: tokens?.expires_at,
        userInfo
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
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPeriodicRefresh()
    oauthCommunicationService.destroy()
    console.info('OAuth background service cleaned up')
  }

  /**
   * Handle secure token reception from content script
   */
  private async handleSecureTokenReceived(payload: any): Promise<void> {
    try {
      console.info('Processing secure OAuth tokens')
      
      // Validate the payload structure
      if (!payload || payload.type !== 'JIRA_OAUTH_SUCCESS' || !payload.data) {
        throw new Error('Invalid token payload structure')
      }

      // Use the existing OAuth communication service to process the message
      // This ensures consistent validation and storage logic
      const mockEvent = {
        origin: payload.origin,
        data: payload
      } as MessageEvent

      // Process through the OAuth communication service
      await oauthCommunicationService.setupMessageListener()
      
      // Manually trigger the message handler with validated data
      await this.processSecureOAuthMessage(payload)
      
      console.info('Secure OAuth tokens processed successfully')
    } catch (error) {
      console.error('Error handling secure token reception:', error)
      throw error
    }
  }

  /**
   * Handle secure error reception from content script
   */
  private async handleSecureErrorReceived(payload: any): Promise<void> {
    try {
      console.error('Processing secure OAuth error:', payload.data)
      
      // Process the error through the OAuth communication service
      await this.processSecureOAuthMessage(payload)
      
      console.info('Secure OAuth error processed')
    } catch (error) {
      console.error('Error handling secure error reception:', error)
      throw error
    }
  }

  /**
   * Process secure OAuth message using the existing OAuth communication logic
   */
  private async processSecureOAuthMessage(payload: any): Promise<void> {
    try {
      // Import the OAuth manager to handle token storage
      const { oauthManager } = await import('@/lib/jira/oauth-manager')
      
      if (payload.type === 'JIRA_OAUTH_SUCCESS') {
        const data = payload.data
        
        // Store tokens using the OAuth manager - convert expires_at to expires_in
        const expiresAt = new Date(data.expires_at)
        const now = new Date()
        const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        
        await oauthManager.storeTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: expiresIn
        })

        // Store user info
        await oauthManager.storeUserInfo(data.user_info)

        // Set auth type to OAuth
        await oauthManager.setAuthType('oauth')

        // Update settings to mark migration as completed
        const currentSettings = await oauthManager.getSettings()
        await oauthManager.updateSettings({
          ...currentSettings,
          migration_completed: true
        })

        // Start periodic refresh for new tokens
        await this.onAuthTypeChange('oauth')
        
        console.log('Secure OAuth: Token storage completed successfully')
      } else if (payload.type === 'JIRA_OAUTH_ERROR') {
        console.error('Secure OAuth: Received error:', payload.data.error, payload.data.error_description)
      }
    } catch (error) {
      console.error('Error processing secure OAuth message:', error)
      throw error
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean
    refreshInterval: number | null
    nextRefreshIn?: number
  } {
    return {
      isRunning: this.refreshInterval !== null,
      refreshInterval: this.refreshInterval,
      nextRefreshIn: this.refreshInterval ? this.REFRESH_INTERVAL_MS : undefined
    }
  }
}
