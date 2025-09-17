import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import {
  generatePKCE,
  generateState,
  buildJiraOAuthUrl,
  validateEnvironmentVariables,
  type OAuthSession
} from '../../../../lib/oauth-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const extensionId = searchParams.get('extension_id')

    if (!extensionId) {
      return NextResponse.json(
        { error: 'extension_id parameter is required' },
        { status: 400 }
      )
    }

    // Validate environment variables
    validateEnvironmentVariables()

    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE()

    // Generate state parameter for CSRF protection
    const state = generateState()

    // Store session data in cookie
    const sessionData: OAuthSession = {
      state,
      extension_id: extensionId,
      code_verifier: codeVerifier,
      created_at: Date.now()
    }

    const cookieStore = await cookies()
    cookieStore.set('oauth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Build Jira OAuth URL
    const redirectUri = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/auth/jira/callback`
    const jiraOAuthUrl = buildJiraOAuthUrl(process.env.JIRA_CLIENT_ID!, {
      redirectUri,
      state,
      codeChallenge
    })

    return NextResponse.redirect(jiraOAuthUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
