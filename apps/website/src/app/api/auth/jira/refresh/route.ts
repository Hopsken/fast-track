import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json()

  if (!refresh_token) {
    return NextResponse.json(
      { error: 'refresh_token parameter is required' },
      { status: 400 }
    )
  }

  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: response.status }
    )
  }

  const data = await response.json()
  return NextResponse.json(data)
}
