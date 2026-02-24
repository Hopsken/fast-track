import { NextRequest, NextResponse } from 'next/server'

import { buildLemonCheckoutUrl } from '../../../../lib/billing/lemonsqueezy/checkout-url'
import { getLemonSqueezyEnv } from '../../../../lib/billing/lemonsqueezy/env.server'
import { isAllowedLemonSqueezyUrl } from '../../../../lib/billing/lemonsqueezy/url'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handleCheckout(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 303
    })
  }

  const { proCheckoutUrl } = getLemonSqueezyEnv()

  const checkoutUrl = buildLemonCheckoutUrl({
    checkoutUrl: proCheckoutUrl,
    userId: user.id,
    email: user.email
  })

  if (!isAllowedLemonSqueezyUrl(checkoutUrl)) {
    return new NextResponse('Invalid checkout URL', { status: 500 })
  }

  return NextResponse.redirect(checkoutUrl, { status: 303 })
}

export async function POST(request: NextRequest) {
  return handleCheckout(request)
}

export async function GET(request: NextRequest) {
  return handleCheckout(request)
}
