import { oauthManager } from '@/lib/jira/oauth-manager'
import { onMessage } from '@/lib/messaging'
import { getStorageItem } from '@/lib/storage'
import loglevel from 'loglevel'

const log = loglevel.getLogger('OAuthCallbackService')

/**
 * OAuth Background Service
 * Handles automatic OAuth token refresh, lifecycle management, and OAuth message handling
 */

export class OAuthCallbackService {
  private refreshInterval: number | null = null
  private readonly REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
  private readonly TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes before expiry

  /**
   * Initialize the OAuth background service
   */
  async initialize(): Promise<void> {
    onMessage('OAUTH_TOKEN_RECEIVED', async (message) => {
      // validate tokens, and store it
      oauthManager.validateAndSaveTokens(message.data)
    })

    this.startPeriodicRefresh()
  }

  /**
   * Start periodic token refresh
   */
  private startPeriodicRefresh(): void {
    if (this.refreshInterval) {
      self.clearInterval(this.refreshInterval)
    }

    this.refreshInterval = self.setInterval(async () => {
      // await oauthManager.refreshTokens()
    }, this.REFRESH_INTERVAL_MS)

    log.info(`Started periodic token refresh`)
  }

  /**
   * Stop periodic token refresh
   */
  private stopPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
      log.info('Stopped periodic token refresh')
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
