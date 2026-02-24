import { NextRequest, NextResponse } from 'next/server'

import { isProFromSubscription } from '../../../../lib/billing/subscription'
import { getExtensionAuthEnv } from '../../../../lib/extension-auth/env.server'
import {
  createExtensionAccessToken,
  createExtensionRefreshToken
} from '../../../../lib/extension-auth/jwt'
import { hashLinkCode } from '../../../../lib/extension-auth/link-code'
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RequestBody = {
  code?: string
  extensionId?: string
}

type SubscriptionRow = {
  status: string
  renews_at: string | null
  ends_at: string | null
  updated_at: string
}

export async function POST(request: NextRequest) {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const extensionId =
    typeof body.extensionId === 'string' ? body.extensionId.trim() : ''

  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 })
  }

  if (!extensionId) {
    return NextResponse.json({ error: 'missing_extension_id' }, { status: 400 })
  }

  const nowIso = new Date().toISOString()
  const codeHash = hashLinkCode(code)

  const admin = createSupabaseAdminClient()

  // Atomic consume: only succeeds once.
  const { data: consumed, error: consumeError } = await admin
    .from('extension_link_codes')
    .update({ consumed_at: nowIso })
    .eq('code_hash', codeHash)
    .eq('extension_id', extensionId)
    .is('consumed_at', null)
    .gt('expires_at', nowIso)
    .select('user_id')
    .maybeSingle<{ user_id: string }>()

  if (consumeError) {
    return NextResponse.json(
      { error: 'failed_to_consume_code' },
      { status: 500 }
    )
  }

  const userId = consumed?.user_id
  if (!userId) {
    return NextResponse.json(
      { error: 'invalid_or_expired_code' },
      { status: 400 }
    )
  }

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

  const { jwtSecret } = getExtensionAuthEnv()

  const [accessToken, refreshToken] = await Promise.all([
    createExtensionAccessToken({ secret: jwtSecret, userId }),
    createExtensionRefreshToken({ secret: jwtSecret, userId })
  ])

  const response = NextResponse.json(
    {
      accessToken,
      refreshToken,
      user: { id: userId, email },
      subscription: subscriptionDto,
      isPro
    },
    { status: 200 }
  )

  response.headers.set('Cache-Control', 'no-store')
  return response
}
