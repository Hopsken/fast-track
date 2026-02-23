export type LoginError = {
  title: string
  description?: string
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function formatLoginError(raw: string | undefined): LoginError | null {
  if (!raw) return null

  const value = safeDecode(raw).trim()
  if (!value) return null

  switch (value) {
    case 'exchange_code_for_session_failed':
      return {
        title: 'Sign-in failed',
        description:
          'We could not finish the sign-in handshake. Please try again.'
      }

    case 'access_denied':
      return {
        title: 'Sign-in cancelled',
        description: 'You cancelled the authentication flow.'
      }

    case 'invalid_request':
      return {
        title: 'Invalid sign-in request',
        description: 'Please try again from the sign-in page.'
      }

    default:
      return {
        title: 'Sign-in error',
        description: value
      }
  }
}
