import crypto from 'node:crypto'

export interface OAuthSession {
  state: string
  extension_id: string
  code_verifier: string
  created_at: number
}

export interface JiraTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface JiraAccessibleResources {
  id: string
  name: string
  url: string
  scopes: string[]
  avatarUrl: string
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  return { codeVerifier, codeChallenge }
}

/**
 * Generate cryptographically secure state parameter
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Validate OAuth session data
 */
export function validateSession(
  sessionData: unknown
): sessionData is OAuthSession {
  return (
    typeof sessionData === 'object' &&
    sessionData !== null &&
    typeof (sessionData as OAuthSession).state === 'string' &&
    typeof (sessionData as OAuthSession).extension_id === 'string' &&
    typeof (sessionData as OAuthSession).code_verifier === 'string' &&
    typeof (sessionData as OAuthSession).created_at === 'number'
  )
}

/**
 * Check if session has expired (default: 10 minutes)
 */
export function isSessionExpired(
  sessionData: OAuthSession,
  maxAgeMs: number = 600000
): boolean {
  return Date.now() - sessionData.created_at > maxAgeMs
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<JiraTokenResponse> {
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID!,
      client_secret: process.env.JIRA_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Token exchange failed: ${errorData}`)
  }

  return response.json()
}

/**
 * Get accessible Jira resources for the user
 */
export async function getAccessibleResources(
  accessToken: string
): Promise<JiraAccessibleResources[]> {
  const response = await fetch(
    'https://api.atlassian.com/oauth/token/accessible-resources',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to get accessible resources: ${response.statusText}`
    )
  }

  return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<JiraTokenResponse> {
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.JIRA_CLIENT_ID!,
      client_secret: process.env.JIRA_CLIENT_SECRET!,
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Token refresh failed: ${errorData}`)
  }

  return response.json()
}

/**
 * Build Jira OAuth authorization URL
 */
export function buildJiraOAuthUrl(
  clientId: string,
  options: {
    redirectUri: string
    state: string
    codeChallenge: string
  }
): string {
  const scopes = ['read:jira-user', 'read:jira-work', 'write:jira-work']
  const url = new URL('https://auth.atlassian.com/authorize')
  url.searchParams.set('audience', 'api.atlassian.com')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', scopes.concat('offline_access').join(' '))
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('state', options.state)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('code_challenge', options.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return url.toString()
}

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(): void {
  const required = [
    'JIRA_CLIENT_ID',
    'JIRA_CLIENT_SECRET',
    'NEXT_PUBLIC_WEBSITE_URL'
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}
