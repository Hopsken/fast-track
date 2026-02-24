import { NextRequest, NextResponse } from 'next/server'

import { buildLemonCheckoutUrl } from '../../../../lib/billing/lemonsqueezy/checkout-url'
import { LEMONSQUEEZY_PRO_CHECKOUT_URL } from '../../../../lib/billing/lemonsqueezy/constants'
import { isAllowedLemonSqueezyUrl } from '../../../../lib/billing/lemonsqueezy/url'
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

  const checkoutUrl = buildLemonCheckoutUrl({
    checkoutUrl: LEMONSQUEEZY_PRO_CHECKOUT_URL,
    userId: user.id,
    email: user.email
  })

  if (!isAllowedLemonSqueezyUrl(checkoutUrl)) {
    return new NextResponse('Invalid checkout URL', { status: 500 })
  }

  return NextResponse.redirect(checkoutUrl, { status: 303 })
}
