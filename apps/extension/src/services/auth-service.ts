import { browser } from '#imports'
import { defineProxyService } from '@webext-core/proxy-service'
import { z } from 'zod'

import { JiraAPI } from '@/lib/jira'
import { AuthApi } from '@/lib/jira/auth-api'
import { getStorageItem } from '@/lib/storage'
import {
  AuthCredentials,
  JiraApiKeyConfig,
  JiraOAuthConfig,
  ReceivedTokenPayload,
  JiraUserInfo
} from '@/types'

import { trackEvent } from './analytics'

export interface AuthService {
  receiveTokens(tokens: ReceivedTokenPayload): Promise<JiraUserInfo>
  connectWithApiKey(
    credentials: Omit<JiraApiKeyConfig, 'type'>
  ): Promise<JiraUserInfo>
  connect(): Promise<string>
  disconnect(): Promise<boolean>
  getCredentials(): Promise<AuthCredentials | null>
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
  private authApi = new AuthApi()

  public async getCredentials(): Promise<AuthCredentials | null> {
    return this.credentialsStorage.getValue()
  }

  public async receiveTokens(
    tokens: ReceivedTokenPayload
  ): Promise<JiraUserInfo> {
    const parsedTokens = tokenSchema.parse(tokens)

    const oauthConfig =
      await this.authApi.getOAuthConfigFromAccessToken(parsedTokens)

    // Build full OAuth config for JiraAPI
    const fullOAuthConfig: JiraOAuthConfig = {
      type: 'oauth',
      host: oauthConfig.host,
      instance_id: oauthConfig.instance_id,
      access_token: oauthConfig.access_token,
      refresh_token: oauthConfig.refresh_token,
      expires_at: oauthConfig.expires_at
    }

    const jiraApi = new JiraAPI(fullOAuthConfig)
    const userInfo = await jiraApi.getMyself()

    // Store consolidated credentials
    const credentials: AuthCredentials = {
      type: 'oauth',
      host: oauthConfig.host,
      userInfo,
      oauth: {
        instance_id: oauthConfig.instance_id,
        access_token: oauthConfig.access_token,
        refresh_token: oauthConfig.refresh_token,
        expires_at: oauthConfig.expires_at
      },
      apiKey: null
    }

    await this.credentialsStorage.setValue(credentials)

    trackEvent('connect_success', { method: 'oauth' })

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

    // Store consolidated credentials
    const authCredentials: AuthCredentials = {
      type: 'apiKey',
      host: normalizedHost,
      userInfo,
      oauth: null,
      apiKey: {
        email: parsedCredentials.email,
        apiKey: parsedCredentials.apiKey
      }
    }

    await this.credentialsStorage.setValue(authCredentials)

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
      getStorageItem('REACT_QUERY_OFFLINE_CACHE').removeValue()
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
