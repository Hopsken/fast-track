import { cookies } from 'next/headers'

import {
  validateSession,
  isSessionExpired,
  exchangeCodeForTokens,
  type OAuthSession,
  type JiraTokenResponse
} from '../../../../lib/oauth-utils'

import CloseButton from './CloseButton'
import ExtensionCommunicator from './ExtensionCommunicator'
import { TokenData } from './type'

interface PageProps {
  searchParams: Promise<{
    code?: string
    state?: string
    error?: string
  }>
}

// Helper function to get error messages
const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'access_denied':
      return 'Authentication was cancelled or access was denied'
    case 'invalid_request':
      return 'Invalid authentication request'
    case 'invalid_client':
      return 'Invalid client configuration'
    case 'invalid_grant':
      return 'Invalid authorization grant'
    case 'unauthorized_client':
      return 'Unauthorized client'
    case 'unsupported_grant_type':
      return 'Unsupported grant type'
    case 'invalid_scope':
      return 'Invalid scope requested'
    case 'session_expired':
      return 'Authentication session has expired'
    case 'invalid_state':
      return 'Invalid state parameter - possible CSRF attack'
    case 'token_exchange_failed':
      return 'Failed to exchange authorization code for tokens'
    case 'missing_parameters':
      return 'Missing required parameters'
    case 'invalid_session':
      return 'Invalid or corrupted session data'
    case 'internal_error':
      return 'Internal server error occurred'
    default:
      return `Authentication error: ${error}`
  }
}

// Helper function to validate session from cookie
const validateSessionFromCookie = async (
  cookieStore: ReturnType<typeof cookies>
): Promise<OAuthSession | null> => {
  const resolvedCookieStore = await cookieStore
  const sessionCookie = resolvedCookieStore.get('oauth_session')
  if (!sessionCookie) return null

  try {
    const parsedData = JSON.parse(sessionCookie.value)
    if (!validateSession(parsedData)) {
      throw new Error('Invalid session structure')
    }
    return parsedData
  } catch {
    return null
  }
}

// Helper function to process authentication
const processAuthentication = async (
  code: string,
  state: string,
  sessionData: OAuthSession
): Promise<{
  status: 'success' | 'error'
  message: string
  tokenData?: TokenData
}> => {
  if (sessionData.state !== state) {
    return {
      status: 'error',
      message: 'Invalid state parameter - possible CSRF attack'
    }
  }

  if (isSessionExpired(sessionData)) {
    return {
      status: 'error',
      message: 'Authentication session has expired'
    }
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/auth/jira/callback`
    const tokens: JiraTokenResponse = await exchangeCodeForTokens(
      code,
      redirectUri
    )

    const tokenData: TokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    }

    return {
      status: 'success',
      message: 'Authentication successful! You can close this window.',
      tokenData
    }
  } catch (tokenError) {
    console.error('Token exchange failed:', tokenError)
    return {
      status: 'error',
      message: 'Failed to exchange authorization code for tokens'
    }
  }
}

type ProcessState = 'processing' | 'success' | 'error'

export default async function JiraCallbackPage(props: PageProps) {
  // eslint-disable-next-line sonarjs/no-dead-store
  let status: ProcessState = 'processing'
  // eslint-disable-next-line sonarjs/no-dead-store
  let message = 'Processing authentication...'
  let tokenData: TokenData | null = null

  const searchParams = await props.searchParams
  const cookieStore = cookies()

  try {
    const { code, state, error } = searchParams

    if (error) {
      status = 'error'
      message = getErrorMessage(error)
    } else if (!code || !state) {
      status = 'error'
      message = 'Missing required parameters'
    } else {
      const sessionData = await validateSessionFromCookie(cookieStore)

      if (!sessionData) {
        status = 'error'
        message = 'Authentication session has expired'
      } else {
        const {
          status: resultStatus,
          message: resultMessage,
          tokenData: resultTokenData
        } = await processAuthentication(code, state, sessionData)
        status = resultStatus
        message = resultMessage
        tokenData = resultTokenData || null
      }
    }
  } catch (serverError) {
    console.error('OAuth callback error:', serverError)
    status = 'error'
    message = 'Internal server error occurred'
  }

  const getStatusIcon = (currentStatus: ProcessState) => {
    switch (currentStatus) {
      case 'processing':
        return (
          <svg
            className="h-6 w-6 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'success':
        return (
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case 'error':
        return (
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
    }
  }

  const getStatusColor = (currentStatus: ProcessState) => {
    switch (currentStatus) {
      case 'processing':
        return 'bg-blue-100'
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
    }
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="text-center">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {status === 'success' && 'Authentication Successful'}
              {status === 'error' && 'Authentication Failed'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
            <CloseButton show={status === 'error' || status === 'success'} />
          </div>
        </div>
      </div>

      {/* Extension communication component */}
      {status === 'success' && tokenData && (
        <ExtensionCommunicator tokenData={tokenData} />
      )}
    </>
  )
}
