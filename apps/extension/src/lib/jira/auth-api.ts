import ky from 'ky'

import { JiraOAuthConfig } from '@/types'

const authApi = ky.extend({
  prefixUrl: 'https://auth.atlassian.com',
  timeout: 10000
})

type AccessibleResource = {
  id: string
  name: string
  url: string
  scopes: string[]
  avatarUrl: string
}

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

  async refreshToken(tokens: JiraOAuthConfig): Promise<JiraOAuthConfig> {
    const clientId = import.meta.env.VITE_JIRA_CLIENT_ID

    const newTokens = await authApi
      .post<{
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
