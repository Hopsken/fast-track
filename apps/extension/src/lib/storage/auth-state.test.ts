import { describe, expect, it } from 'vitest'

import type { JiraApiKeyConfig, JiraOAuthConfig } from '~/types'

import { AUTH_STATE_DEFAULT, deriveAuthStateFromLegacy } from './auth-state'

describe('deriveAuthStateFromLegacy', () => {
  it('prefers legacy oauth tokens when current state is default', () => {
    const oauthTokens: JiraOAuthConfig = {
      type: 'oauth',
      host: 'https://example.atlassian.net',
      instance_id: 'instance',
      access_token: 'access',
      refresh_token: 'refresh',
      expires_at: '2024-01-01T00:00:00.000Z'
    }

    const nextState = deriveAuthStateFromLegacy(AUTH_STATE_DEFAULT, {
      authType: 'oauth',
      oauthTokens
    })

    expect(nextState.type).toBe('oauth')
    expect(nextState.oauth).toEqual(oauthTokens)
    expect(nextState.apiKey).toBeNull()
  })

  it('prefers legacy api key auth when current state is default', () => {
    const apiKeyAuth: JiraApiKeyConfig = {
      type: 'apiKey',
      host: 'https://example.atlassian.net',
      email: 'user@example.com',
      apiKey: 'api-key'
    }

    const nextState = deriveAuthStateFromLegacy(AUTH_STATE_DEFAULT, {
      authType: 'apiKey',
      apiKeyAuth
    })

    expect(nextState.type).toBe('apiKey')
    expect(nextState.apiKey).toEqual(apiKeyAuth)
    expect(nextState.oauth).toBeNull()
  })

  it('infers oauth type when legacy tokens exist without auth type', () => {
    const oauthTokens: JiraOAuthConfig = {
      type: 'oauth',
      host: 'https://example.atlassian.net',
      instance_id: 'instance',
      access_token: 'access',
      refresh_token: 'refresh',
      expires_at: '2024-01-01T00:00:00.000Z'
    }

    const nextState = deriveAuthStateFromLegacy(AUTH_STATE_DEFAULT, {
      oauthTokens
    })

    expect(nextState.type).toBe('oauth')
    expect(nextState.oauth).toEqual(oauthTokens)
  })

  it('keeps current type while merging in legacy data', () => {
    const apiKeyAuth: JiraApiKeyConfig = {
      type: 'apiKey',
      host: 'https://example.atlassian.net',
      email: 'user@example.com',
      apiKey: 'api-key'
    }

    const oauthTokens: JiraOAuthConfig = {
      type: 'oauth',
      host: 'https://example.atlassian.net',
      instance_id: 'instance',
      access_token: 'access',
      refresh_token: 'refresh',
      expires_at: '2024-01-01T00:00:00.000Z'
    }

    const nextState = deriveAuthStateFromLegacy(
      {
        type: 'apiKey',
        apiKey: apiKeyAuth,
        oauth: null
      },
      {
        oauthTokens
      }
    )

    expect(nextState.type).toBe('apiKey')
    expect(nextState.apiKey).toEqual(apiKeyAuth)
    expect(nextState.oauth).toEqual(oauthTokens)
  })

  it('falls back to api key when oauth data is missing', () => {
    const apiKeyAuth: JiraApiKeyConfig = {
      type: 'apiKey',
      host: 'https://example.atlassian.net',
      email: 'user@example.com',
      apiKey: 'api-key'
    }

    const nextState = deriveAuthStateFromLegacy(
      {
        type: 'oauth',
        oauth: null,
        apiKey: null
      },
      {
        apiKeyAuth
      }
    )

    expect(nextState.type).toBe('apiKey')
    expect(nextState.apiKey).toEqual(apiKeyAuth)
  })
})
