import { browser } from '#imports'
import { defineProxyService } from '@webext-core/proxy-service'
import { z } from 'zod'

import { JiraAPI } from '@/lib/jira'
import { AuthApi } from '@/lib/jira/auth-api'
import { getStorageItem, StorageKey } from '@/lib/storage'
import { Database, resetDatabase } from '@/repository'
import { JiraApiKeyConfig, ReceivedTokenPayload, JiraUserInfo } from '@/types'
import { getTicketService } from '~/services/ticket-service'
import { getLogger } from '~/utils/logger'

export interface AuthService {
  receiveTokens(tokens: ReceivedTokenPayload): Promise<JiraUserInfo>
  connectWithApiKey(
    credentials: Omit<JiraApiKeyConfig, 'type'>
  ): Promise<JiraUserInfo>
  connect(): Promise<string>
  disconnect(): Promise<boolean>
}

const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.iso.datetime()
})

const apiKeySchema = z.object({
  host: z.string().min(1),
  email: z.email(),
  apiKey: z.string().min(1)
})

class AuthServiceImpl implements AuthService {
  private tokenStorage = getStorageItem('OAuthTokens')
  private apiKeyStorage = getStorageItem('ApiKeyAuth')
  private userInfoStorage = getStorageItem('OAuthUserInfo')
  private authTypeStorage = getStorageItem('AuthType')
  private jiraHostStorage = getStorageItem('JiraHost')
  private authApi = new AuthApi()
  private log = getLogger('auth-service')

  constructor(private database: Database) {}

  public async receiveTokens(
    tokens: ReceivedTokenPayload
  ): Promise<JiraUserInfo> {
    const parsedTokens = tokenSchema.parse(tokens)

    const oauthConfig =
      await this.authApi.getOAuthConfigFromAccessToken(parsedTokens)
    await Promise.all([
      this.tokenStorage.setValue(oauthConfig),
      this.authTypeStorage.setValue('oauth'),
      this.jiraHostStorage.setValue(oauthConfig.host),
      this.apiKeyStorage.removeValue()
    ])

    const jiraApi = new JiraAPI(oauthConfig)
    const userInfo = await jiraApi.getMyself()

    await this.userInfoStorage.setValue(userInfo)
    await this.primeSuggestionsAfterAuth()

    return userInfo
  }

  public async connectWithApiKey(
    credentials: Omit<JiraApiKeyConfig, 'type'>
  ): Promise<JiraUserInfo> {
    const parsedCredentials = apiKeySchema.parse(credentials)
    const normalizedHost = this.normalizeHost(parsedCredentials.host)
    const apiKeyConfig: JiraApiKeyConfig = {
      ...parsedCredentials,
      host: normalizedHost,
      type: 'apiKey'
    }

    const jiraApi = new JiraAPI(apiKeyConfig)
    const userInfo = await jiraApi.getMyself()

    await Promise.all([
      this.apiKeyStorage.setValue(apiKeyConfig),
      this.authTypeStorage.setValue('apiKey'),
      this.tokenStorage.removeValue(),
      this.jiraHostStorage.setValue(normalizedHost),
      this.userInfoStorage.setValue(userInfo)
    ])

    await this.primeSuggestionsAfterAuth()

    return userInfo
  }

  public async connect() {
    return this.initiateFlow()
  }

  public async disconnect() {
    await Promise.all([
      this.tokenStorage.removeValue(),
      this.apiKeyStorage.removeValue(),
      this.userInfoStorage.removeValue(),
      this.jiraHostStorage.removeValue(),
      getStorageItem('LastSyncAt').removeValue(),
      // Clear React Query cache
      getStorageItem('REACT_QUERY_OFFLINE_CACHE').removeValue(),
      resetDatabase()
    ])

    return true
  }

  private async primeSuggestionsAfterAuth() {
    const ticketService = getTicketService()
    try {
      await ticketService.suggestions.refresh('auth')
    } catch (error) {
      this.log.error(
        'AuthService: failed to prefetch suggestions after auth',
        error
      )
    }
  }

  /**
   * Initiate OAuth flow
   * Opens the website OAuth page with the extension ID
   */
  private initiateFlow() {
    const currentExtensionId = browser.runtime.id

    // Use local development URL in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    const baseUrl = isDevelopment
      ? 'http://localhost:4000'
      : 'https://teamusement.com'

    return `${baseUrl}/auth/jira?extension_id=${currentExtensionId}`
  }

  private normalizeHost(host: string) {
    const trimmed = host.trim()
    const prefixed =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed
  }
}

export const [registerAuthService, getAuthService] = defineProxyService<
  AuthService,
  [Database]
>('AuthService', (database: Database) => new AuthServiceImpl(database))
