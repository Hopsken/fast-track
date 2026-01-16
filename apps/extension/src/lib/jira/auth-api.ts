import ky from 'ky'

import { JiraOAuthConfig } from '@/types'

import { boostApi } from '../api'

type AccessibleResource = {
  id: string
  name: string
  url: string
  scopes: string[]
  avatarUrl: string
}

/**
 * Shared refresh promise to prevent concurrent refresh attempts.
 * Refresh tokens are typically single-use, so concurrent refreshes would fail.
 */
let refreshPromise: Promise<JiraOAuthConfig> | null = null

export class AuthApi {
  private async getAccessibleResources(access_token: string) {
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

  async getOAuthConfigFromAccessToken(
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

  /**
   * Refresh OAuth token with mutex to prevent concurrent refresh attempts.
   * If a refresh is already in progress, returns the existing promise.
   */
  async refreshToken(tokens: JiraOAuthConfig): Promise<JiraOAuthConfig> {
    // Return existing refresh promise if one is in progress
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = this.doRefreshToken(tokens).finally(() => {
      refreshPromise = null
    })

    return refreshPromise
  }

  private async doRefreshToken(
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
