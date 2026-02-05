import { browser } from '#imports'
import { defineProxyService } from '@webext-core/proxy-service'
import { z } from 'zod'

import { JiraAPI } from '@/lib/jira'
import { AuthManager } from '@/lib/jira/authManager'
import { getStorageItem } from '@/lib/storage'
import { AuthCredentials, ReceivedTokenPayload, JiraUserInfo } from '@/types'

import { trackEvent } from './analytics'

export interface AuthService {
  receiveTokens(tokens: ReceivedTokenPayload): Promise<JiraUserInfo>
  connectWithApiKey(credentials: {
    host: string
    email: string
    apiKey: string
  }): Promise<JiraUserInfo>
  connect(): Promise<string>
  disconnect(): Promise<boolean>
  getCredentials(): Promise<AuthCredentials | null>
  getCurrentHost(): Promise<string | null>
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
  private credentialsStorage = getStorageItem('AuthCredentials')
  private authManager = AuthManager.getInstance()

  public async getCredentials(): Promise<AuthCredentials | null> {
    return this.credentialsStorage.getValue()
  }

  public async getCurrentHost(): Promise<string | null> {
    const creds = await this.credentialsStorage.getValue()
    return creds?.host || null
  }

  public async receiveTokens(
    tokens: ReceivedTokenPayload
  ): Promise<JiraUserInfo> {
    const parsedTokens = tokenSchema.parse(tokens)

    const oauthConfig =
      await AuthManager.getOAuthConfigFromAccessToken(parsedTokens)

    // Build credentials for validation
    const credentials: AuthCredentials = {
      type: 'oauth',
      host: oauthConfig.host,
      userInfo: null,
      oauth: {
        instance_id: oauthConfig.instance_id,
        access_token: oauthConfig.access_token,
        refresh_token: oauthConfig.refresh_token,
        expires_at: oauthConfig.expires_at
      },
      apiKey: null
    }

    const userInfo = await JiraAPI.validateCredentials(credentials)

    // Store with user info
    credentials.userInfo = userInfo
    await this.credentialsStorage.setValue(credentials)

    trackEvent('connect_success', { method: 'oauth' })

    return userInfo
  }

  public async connectWithApiKey(input: {
    host: string
    email: string
    apiKey: string
  }): Promise<JiraUserInfo> {
    const parsedCredentials = apiKeySchema.parse(input)
    const normalizedHost = this.normalizeHost(parsedCredentials.host)

    // Build credentials for validation
    const credentials: AuthCredentials = {
      type: 'apiKey',
      host: normalizedHost,
      userInfo: null,
      oauth: null,
      apiKey: {
        email: parsedCredentials.email,
        apiKey: parsedCredentials.apiKey
      }
    }

    const userInfo = await JiraAPI.validateCredentials(credentials)

    // Store with user info
    credentials.userInfo = userInfo
    await this.credentialsStorage.setValue(credentials)

    trackEvent('connect_success', { method: 'apiKey' })

    return userInfo
  }

  public async connect() {
    return this.initiateFlow()
  }

  public async disconnect() {
    trackEvent('disconnect')

    await Promise.all([
      this.credentialsStorage.removeValue(),
      // Clear React Query cache
      getStorageItem('REACT_QUERY_OFFLINE_CACHE').removeValue(),
      getStorageItem('ProjectClicks').removeValue()
    ])

    return true
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
  []
>('AuthService', () => new AuthServiceImpl())
