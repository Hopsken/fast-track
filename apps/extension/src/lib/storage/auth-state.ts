import type {
  AuthState,
  AuthType,
  JiraApiKeyConfig,
  JiraOAuthConfig
} from '~/types'

import { AUTH_STATE_DEFAULT, getStorageItem } from './schema'

export { AUTH_STATE_DEFAULT } from './schema'

type LegacyAuthState = {
  authType?: AuthType | null
  oauthTokens?: JiraOAuthConfig | null
  apiKeyAuth?: JiraApiKeyConfig | null
}

export const deriveAuthStateFromLegacy = (
  current: AuthState,
  legacy: LegacyAuthState
): AuthState => {
  const nextOauth = current.oauth ?? legacy.oauthTokens ?? null
  const nextApiKey = current.apiKey ?? legacy.apiKeyAuth ?? null
  const legacyType = legacy.authType ?? null

  let nextType: AuthType | null = current.type ?? legacyType

  if (!nextType) {
    if (nextApiKey) {
      nextType = 'apiKey'
    } else if (nextOauth) {
      nextType = 'oauth'
    }
  }

  if (nextType === 'apiKey' && !nextApiKey && nextOauth) {
    nextType = 'oauth'
  }

  if (nextType === 'oauth' && !nextOauth && nextApiKey) {
    nextType = 'apiKey'
  }

  return {
    type: nextType ?? 'oauth',
    oauth: nextOauth,
    apiKey: nextApiKey
  }
}

export const updateAuthState = async (
  updater: (state: AuthState) => AuthState
): Promise<AuthState> => {
  const authStateItem = getStorageItem('AuthState')
  const current = await authStateItem.getValue()
  const next = updater(current)
  await authStateItem.setValue(next)
  return next
}

export const clearAuthState = async (): Promise<void> => {
  const authStateItem = getStorageItem('AuthState')
  await authStateItem.setValue(AUTH_STATE_DEFAULT)
}

export const migrateLegacyAuthState = async (): Promise<boolean> => {
  const authStateItem = getStorageItem('AuthState')
  const authTypeItem = getStorageItem('AuthType')
  const oauthTokensItem = getStorageItem('OAuthTokens')
  const apiKeyAuthItem = getStorageItem('ApiKeyAuth')

  const [currentState, authType, oauthTokens, apiKeyAuth] = await Promise.all([
    authStateItem.getValue(),
    authTypeItem.getValue(),
    oauthTokensItem.getValue(),
    apiKeyAuthItem.getValue()
  ])

  const hasLegacyData = Boolean(authType || oauthTokens || apiKeyAuth)
  if (!hasLegacyData) return false

  const nextState = deriveAuthStateFromLegacy(currentState, {
    authType,
    oauthTokens,
    apiKeyAuth
  })

  await authStateItem.setValue(nextState)

  await Promise.all([
    authTypeItem.removeValue(),
    oauthTokensItem.removeValue(),
    apiKeyAuthItem.removeValue()
  ])

  return true
}
