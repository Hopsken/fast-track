/**
 * Jira API - Singleton service with transparent auth management
 *
 * Usage:
 *   const jira = getJiraApi()
 *   const ticket = await jira.issues.getIssue('KEY-123')
 */

import { Config, Version3Client } from 'jira.js'

import { AuthCredentials, JiraUserInfo } from '@/types'
import { isValidCredentials } from '@/utils/auth'
import { getLogger } from '@/utils/logger'

import { fromStorage$, getStorageItem } from '../storage'

import { AuthApi } from './auth-api'
import { JiraIssueService } from './issues'

const log = getLogger('jira-api')

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

/**
 * Build jira.js client config from AuthCredentials
 */
function buildClientConfig(credentials: AuthCredentials): Config {
  if (credentials.type === 'oauth' && credentials.oauth) {
    return {
      host: `https://api.atlassian.com/ex/jira/${credentials.oauth.instance_id}`,
      authentication: {
        oauth2: {
          accessToken: credentials.oauth.access_token
        }
      }
    }
  }

  if (credentials.type === 'apiKey' && credentials.apiKey) {
    return {
      host: credentials.host,
      authentication: {
        basic: {
          email: credentials.apiKey.email,
          apiToken: credentials.apiKey.apiKey
        }
      }
    }
  }

  throw new Error('Invalid credentials: missing oauth or apiKey data')
}

/**
 * Jira API singleton with automatic auth management.
 *
 * Credentials are cached from storage subscription - no async storage reads on API calls.
 * Token refresh is handled proactively via scheduled timeouts.
 */
class JiraAPIImpl {
  private authApi = new AuthApi()

  private credentials: AuthCredentials | null = null
  private v3Client: Version3Client | null = null
  private clientCredentialsSignature: string | null = null
  private refreshTimeoutId: number | null = null
  private refreshPromise: Promise<void> | null = null
  private issueService: JiraIssueService | null = null

  constructor() {
    this.setupAuthSubscription()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auth Management
  // ─────────────────────────────────────────────────────────────────────────

  private setupAuthSubscription(): void {
    fromStorage$('AuthCredentials').subscribe((credentials) => {
      this.credentials = credentials

      // Clear if no credentials or invalid
      if (!isValidCredentials(credentials)) {
        log.info(credentials ? 'Invalid credentials, cleared' : 'Auth cleared')
        this.credentials = null
        this.invalidateClient()
        return
      }

      // Invalidate client if credentials changed (new client will be created on next getClient)
      const newSignature = this.computeSignature(credentials)
      if (this.v3Client && this.clientCredentialsSignature !== newSignature) {
        this.invalidateClient()
        log.debug('Credentials changed, client invalidated')
      }

      // Schedule proactive token refresh for OAuth
      if (credentials.type === 'oauth' && credentials.oauth) {
        this.scheduleTokenRefresh(credentials)
      }
    })
  }

  private computeSignature(credentials: AuthCredentials): string {
    if (credentials.type === 'oauth' && credentials.oauth) {
      return `oauth:${credentials.oauth.instance_id}:${credentials.oauth.access_token}`
    }
    if (credentials.type === 'apiKey' && credentials.apiKey) {
      return `apiKey:${credentials.host}:${credentials.apiKey.email}:${credentials.apiKey.apiKey}`
    }
    return ''
  }

  private invalidateClient(): void {
    this.v3Client = null
    this.clientCredentialsSignature = null
    this.issueService = null
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId)
      this.refreshTimeoutId = null
    }
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

    this.refreshPromise = this.refreshTokens(credentials)
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

  private async refreshTokens(credentials: AuthCredentials): Promise<void> {
    if (credentials.type !== 'oauth' || !credentials.oauth) return

    try {
      log.info('Refreshing OAuth tokens')
      const refreshed = await this.authApi.refreshToken({
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
        return
      }

      // Update storage - this triggers subscription which updates cached credentials
      await getStorageItem('AuthCredentials').setValue({
        ...credentials,
        oauth: {
          instance_id: refreshed.instance_id,
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at
        }
      })
      log.info('Tokens refreshed and persisted')
    } catch (error) {
      // TODO: Handle specific errors (e.g., network, invalid credentials)
      log.error('Token refresh failed, clearing credentials', error)
      // await getStorageItem('AuthCredentials').removeValue()
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Client Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the jira.js V3 client.
   * Uses cached credentials from subscription.
   * Falls back to storage read if subscription hasn't emitted yet.
   */
  private async getClient(): Promise<Version3Client> {
    // Fallback to storage if subscription hasn't emitted yet
    let credentials = this.credentials
    if (!credentials) {
      credentials = await getStorageItem('AuthCredentials').getValue()
      if (credentials) {
        this.credentials = credentials
      }
    }

    if (!credentials) {
      throw new Error('Jira not configured')
    }

    if (credentials.type === 'oauth' && credentials.oauth) {
      await this.refreshTokensIfNeeded(credentials)
      credentials = await getStorageItem('AuthCredentials').getValue()
      if (!credentials) {
        throw new Error('Jira not configured')
      }
    }

    // Return cached client if credentials haven't changed
    const signature = this.computeSignature(credentials)
    if (this.v3Client && this.clientCredentialsSignature === signature) {
      return this.v3Client
    }

    // Create new client
    this.v3Client = new Version3Client(buildClientConfig(credentials))
    this.clientCredentialsSignature = signature
    this.issueService = null // Will be recreated with new client
    log.debug('Created new jira.js client')

    return this.v3Client
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Issue operations (search, get, update, transition, etc.)
   */
  get issues(): JiraIssueService {
    if (!this.issueService) {
      this.issueService = new JiraIssueService(
        async () => this.getClient(),
        () => this.getWebBaseUrl()
      )
    }
    return this.issueService
  }

  /**
   * Get current user info
   */
  async getMyself(): Promise<JiraUserInfo> {
    const client = await this.getClient()
    const user = await client.myself.getCurrentUser()
    return {
      accountId: user.accountId,
      email: user.emailAddress ?? '',
      name: user.displayName ?? '',
      avatarUrl: user.avatarUrls?.['16x16']
    }
  }

  /**
   * Send a raw request to Jira API
   */
  async request<T>(
    config: Parameters<Version3Client['sendRequest']>[0]
  ): Promise<T> {
    const client = await this.getClient()
    return client.sendRequest<T>(config, undefined as never)
  }

  /**
   * Get current host URL (if connected)
   */
  getHost(): string | null {
    return this.credentials?.host ?? null
  }

  /**
   * Check if Jira is configured
   */
  isConfigured(): boolean {
    return !!this.credentials
  }

  /**
   * Get the web base URL for the connected Jira instance
   */
  private getWebBaseUrl(): string {
    const host = this.credentials?.host
    if (!host) return ''
    return host.endsWith('/') ? host.slice(0, -1) : host
  }

  /**
   * Validate credentials without affecting singleton state.
   * Used during login flow.
   */
  static async validateCredentials(
    credentials: AuthCredentials
  ): Promise<JiraUserInfo> {
    const client = new Version3Client(buildClientConfig(credentials))
    const user = await client.myself.getCurrentUser()
    return {
      accountId: user.accountId,
      email: user.emailAddress ?? '',
      name: user.displayName ?? '',
      avatarUrl: user.avatarUrls?.['16x16']
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────────────────────

let instance: JiraAPIImpl | null = null

/**
 * Get the Jira API singleton.
 * Auth is handled internally - just use the returned instance.
 */
export function getJiraApi(): JiraAPIImpl {
  if (!instance) {
    instance = new JiraAPIImpl()
  }
  return instance
}

// Export class for type usage and static methods
export { JiraAPIImpl as JiraAPI }
