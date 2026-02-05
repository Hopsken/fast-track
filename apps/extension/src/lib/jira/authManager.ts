import ky from 'ky'

import { AuthCredentials, JiraOAuthConfig } from '@/types'
import { getLogger } from '@/utils'
import { isValidCredentials } from '@/utils/auth'

import { boostApi } from '../api'
import { fromStorage$, getStorageItem } from '../storage'

const log = getLogger('AuthManager')

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

type AccessibleResource = {
  id: string
  name: string
  url: string
  scopes: string[]
  avatarUrl: string
}

export class AuthManager {
  private credentials: AuthCredentials | null = null

  private clientCredentialsSignature: string | null = null
  private refreshTimeoutId: number | null = null
  private refreshPromise: Promise<unknown> | null = null

  private static authManager: AuthManager | null = null

  public static getInstance(): AuthManager {
    if (!AuthManager.authManager) {
      AuthManager.authManager = new AuthManager()
    }
    return AuthManager.authManager
  }

  public static computeSignature(credentials: AuthCredentials): string {
    if (credentials.type === 'oauth' && credentials.oauth) {
      return `oauth:${credentials.oauth.instance_id}:${credentials.oauth.access_token}`
    }
    if (credentials.type === 'apiKey' && credentials.apiKey) {
      return `apiKey:${credentials.host}:${credentials.apiKey.email}:${credentials.apiKey.apiKey}`
    }
    return ''
  }

  private constructor() {
    this.credentials = null
    this.setupAuthSubscription()
  }

  public async getCredentials(): Promise<AuthCredentials | null> {
    const credentials = this.credentials

    // Return cached credentials if not expiring
    if (credentials && !this.isTokenExpiring(credentials)) {
      return credentials
    }

    // If refresh is in progress, wait for it to complete
    if (this.refreshPromise) {
      await this.refreshPromise
      return this.credentials
    }

    return null
  }

  // OAuth2 helpers
  public static async getOAuthConfigFromAccessToken(
    tokens: Pick<
      JiraOAuthConfig,
      'access_token' | 'refresh_token' | 'expires_at'
    >
  ): Promise<JiraOAuthConfig> {
    const [resource] = await this.getAccessibleResources(tokens.access_token)
    if (!resource) throw new Error('Invalid token, no resource linked')
    return {
      type: 'oauth',
      host: resource.url,
      instance_id: resource.id,
      ...tokens
    }
  }

  private static async getAccessibleResources(access_token: string) {
    const response = await ky.get<AccessibleResource[]>(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    return response.json()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auth Management
  // ─────────────────────────────────────────────────────────────────────────

  private setupAuthSubscription(): void {
    fromStorage$('AuthCredentials').subscribe((credentials) => {
      // Clear if no credentials or invalid
      if (!isValidCredentials(credentials)) {
        log.info(credentials ? 'Invalid credentials, cleared' : 'Auth cleared')
        this.credentials = null
        return
      }

      this.credentials = credentials

      // Schedule proactive token refresh for OAuth
      if (credentials.type === 'oauth' && credentials.oauth) {
        this.scheduleTokenRefresh(credentials)
      }
    })
  }

  private scheduleTokenRefresh(credentials: AuthCredentials): void {
    if (credentials.type !== 'oauth' || !credentials.oauth) return

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId)
    }

    const expiresAtMs = new Date(credentials.oauth.expires_at).getTime()
    const delay = Math.max(expiresAtMs - Date.now() - TOKEN_EXPIRY_BUFFER_MS, 0)

    log.debug(`Token refresh scheduled in ${Math.round(delay / 1000)}s`)

    this.refreshTimeoutId = self.setTimeout(() => {
      this.refreshTokensIfNeeded(credentials).catch((err) => {
        log.error('Proactive token refresh failed', err)
      })
    }, delay)
  }

  private isTokenExpiring(credentials: AuthCredentials): boolean {
    if (credentials.type !== 'oauth' || !credentials.oauth) return false
    const expiresAtMs = new Date(credentials.oauth.expires_at).getTime()
    return expiresAtMs - TOKEN_EXPIRY_BUFFER_MS <= Date.now()
  }

  private async refreshTokensIfNeeded(
    credentials: AuthCredentials
  ): Promise<void> {
    if (!this.isTokenExpiring(credentials)) {
      return
    }

    if (this.refreshPromise) {
      await this.refreshPromise
      return
    }

    this.refreshPromise = this.refreshTokenAndPersist(credentials)
    try {
      await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async shouldPersistRefreshedCredentials(
    credentials: AuthCredentials
  ): Promise<boolean> {
    const stored = await getStorageItem('AuthCredentials').getValue()
    if (!stored || stored.type !== 'oauth' || !stored.oauth) {
      return false
    }

    return (
      stored.host === credentials.host &&
      stored.oauth.instance_id === credentials.oauth?.instance_id &&
      stored.oauth.refresh_token === credentials.oauth?.refresh_token
    )
  }

  private async refreshTokenAndPersist(
    credentials: AuthCredentials
  ): Promise<JiraOAuthConfig | null> {
    if (credentials.type !== 'oauth' || !credentials.oauth) {
      throw new Error('Cannot refresh tokens: credentials are not OAuth')
    }

    try {
      log.info('Refreshing OAuth tokens')
      const refreshed = await this.refreshToken({
        type: 'oauth',
        host: credentials.host,
        instance_id: credentials.oauth.instance_id,
        access_token: credentials.oauth.access_token,
        refresh_token: credentials.oauth.refresh_token,
        expires_at: credentials.oauth.expires_at
      })

      const shouldPersist =
        await this.shouldPersistRefreshedCredentials(credentials)
      if (!shouldPersist) {
        log.info('Skipping token persist; credentials changed or cleared')
        return null
      }

      // Update storage - this triggers subscription which updates cached credentials
      const updatedCredentials = {
        ...credentials,
        oauth: {
          instance_id: refreshed.instance_id,
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at
        }
      }
      this.credentials = updatedCredentials
      await getStorageItem('AuthCredentials').setValue(updatedCredentials)
      log.info('Tokens refreshed and persisted')
      return refreshed
    } catch (error) {
      log.error('Token refresh failed', error)
      return null
    }
  }

  private async refreshToken(
    tokens: JiraOAuthConfig
  ): Promise<JiraOAuthConfig> {
    const newTokens = await boostApi
      .post<{
        access_token: string
        refresh_token: string
        expires_in: number // in seconds
      }>('api/auth/jira/refresh', {
        json: {
          refresh_token: tokens.refresh_token
        }
      })
      .json()

    return {
      ...tokens,
      refresh_token: newTokens.refresh_token,
      access_token: newTokens.access_token,
      expires_at: new Date(
        Date.now() + newTokens.expires_in * 1000
      ).toISOString()
    }
  }
}
