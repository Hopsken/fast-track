import { NextRequest, NextResponse } from 'next/server'

import { isProFromSubscription } from '../../../../lib/billing/subscription'
import { getExtensionAuthEnv } from '../../../../lib/extension-auth/env.server'
import { verifyExtensionAccessToken } from '../../../../lib/extension-auth/jwt'
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SubscriptionRow = {
  status: string
  renews_at: string | null
  ends_at: string | null
  updated_at: string
}

function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token.trim()
}

export async function GET(request: NextRequest) {
  const token = bearerToken(request)
  if (!token) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 })
  }

  const { jwtSecret } = getExtensionAuthEnv()

  let userId: string
  try {
    ;({ userId } = await verifyExtensionAccessToken({
      secret: jwtSecret,
      token
    }))
  } catch {
    return NextResponse.json({ error: 'invalid_access_token' }, { status: 401 })
  }

  const admin = createSupabaseAdminClient()
  const { data: userRes } = await admin.auth.admin.getUserById(userId)
  const email = userRes.user?.email ?? null

  const { data: subscription } = await admin
    .from('billing_subscriptions')
    .select('status, renews_at, ends_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle<SubscriptionRow>()

  const subscriptionDto = subscription
    ? {
        status: subscription.status,
        renewsAt: subscription.renews_at,
        endsAt: subscription.ends_at,
        updatedAt: subscription.updated_at
      }
    : null

  const isPro = isProFromSubscription(
    subscription
      ? { status: subscription.status, endsAt: subscription.ends_at }
      : null
  )

  const response = NextResponse.json(
    {
      user: { id: userId, email },
      subscription: subscriptionDto,
      isPro,
      checkedAt: new Date().toISOString()
    },
    { status: 200 }
  )

  response.headers.set('Cache-Control', 'no-store')
  return response
}
