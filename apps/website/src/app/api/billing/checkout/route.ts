import { NextRequest, NextResponse } from 'next/server'

import { buildLemonCheckoutUrl } from '../../../../lib/billing/lemonsqueezy/checkout-url'
import { getLemonSqueezyEnv } from '../../../../lib/billing/lemonsqueezy/env.server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

  return NextResponse.redirect(checkoutUrl, { status: 303 })
}
