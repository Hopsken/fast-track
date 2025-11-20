import { browser } from '#imports'

import { defineProxyService } from '@webext-core/proxy-service'
import z from 'zod'

import { JiraAPI } from '@/lib/jira'
import { AuthApi } from '@/lib/jira/auth-api'
import { getStorageItem } from '@/lib/storage'
import { Database } from '@/repository'
import { ReceivedTokenPayload, JiraUserInfo } from '@/types'

const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.iso.datetime()
})

class AuthServiceImpl {
  private tokenStorage = getStorageItem('OAuthTokens')
  private userInfoStorage = getStorageItem('OAuthUserInfo')
  private authApi = new AuthApi()

  constructor(private database: Database) {}

  public async receiveTokens(
    tokens: ReceivedTokenPayload
  ): Promise<JiraUserInfo> {
    const parsedTokens = tokenSchema.parse(tokens)

    const oauthConfig =
      await this.authApi.getOAuthConfigFromAccessToken(parsedTokens)
    this.tokenStorage.setValue(oauthConfig)

    const jiraApi = new JiraAPI(oauthConfig)
    const userInfo = await jiraApi.getMyself()

    await this.userInfoStorage.setValue(userInfo)

    return userInfo
  }

  public connect() {
    return this.initiateFlow()
  }

  public async disconnect() {
    await Promise.all([
      this.tokenStorage.removeValue(),
      this.userInfoStorage.removeValue(),
      this.database.collections.issues.remove()
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
}

export const [registerAuthService, getAuthService] = defineProxyService(
  'AuthService',
  (database: Database) => new AuthServiceImpl(database)
)
