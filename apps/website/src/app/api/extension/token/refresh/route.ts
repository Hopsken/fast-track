import { NextRequest, NextResponse } from 'next/server'

import { getExtensionAuthEnv } from '../../../../../lib/extension-auth/env.server'
import {
  createExtensionAccessToken,
  verifyExtensionRefreshToken
} from '../../../../../lib/extension-auth/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RequestBody = {
  refreshToken?: string
}

export async function POST(request: NextRequest) {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const refreshToken =
    typeof body.refreshToken === 'string' ? body.refreshToken.trim() : ''

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'missing_refresh_token' },
      { status: 400 }
    )
  }

  const { jwtSecret } = getExtensionAuthEnv()

  let userId: string
  try {
    ;({ userId } = await verifyExtensionRefreshToken({
      secret: jwtSecret,
      token: refreshToken
    }))
  } catch {
    return NextResponse.json(
      { error: 'invalid_refresh_token' },
      { status: 401 }
    )
  }

  const accessToken = await createExtensionAccessToken({
    secret: jwtSecret,
    userId
  })

  const response = NextResponse.json({ accessToken }, { status: 200 })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
