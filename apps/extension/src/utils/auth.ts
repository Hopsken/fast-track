import { AuthCredentials } from '@/types'

/**
 * Type guard to check if credentials have all required fields for authentication.
 * This is a synchronous check that can be used in UI components
 * without requiring an async call to the background service.
 */
export function isValidCredentials(
  credentials: AuthCredentials | null
): credentials is AuthCredentials {
  if (!credentials || !credentials.host) {
    return false
  }

  if (credentials.type === 'oauth') {
    const { oauth } = credentials
    return !!(
      oauth &&
      oauth.instance_id &&
      oauth.access_token &&
      oauth.refresh_token &&
      oauth.expires_at
    )
  }

  if (credentials.type === 'apiKey') {
    const { apiKey } = credentials
    return !!(apiKey && apiKey.email && apiKey.apiKey)
  }

  return false
}
