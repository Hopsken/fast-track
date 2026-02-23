import { NextRequest, NextResponse } from 'next/server'

import { fetchLemonSqueezyCustomerPortalUrlForSubscription } from '../../../../lib/billing/lemonsqueezy/customer-portal'
import { getLemonSqueezyApiEnv } from '../../../../lib/billing/lemonsqueezy/env.server'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'

type SubscriptionRow = {
  lemonsqueezy_subscription_id: string | null
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 303
    })
  }

  const { data: subscription, error } = await supabase
    .from('billing_subscriptions')
    .select('lemonsqueezy_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle<SubscriptionRow>()

  if (error) {
    return new NextResponse('Failed to load subscription', { status: 500 })
  }

  const subscriptionId = subscription?.lemonsqueezy_subscription_id
  if (!subscriptionId) {
    return new NextResponse('Missing LemonSqueezy subscription id', {
      status: 400
    })
  }

  const { apiKey } = getLemonSqueezyApiEnv()

  const portalUrl = await fetchLemonSqueezyCustomerPortalUrlForSubscription({
    apiKey,
    subscriptionId
  })

  return NextResponse.redirect(portalUrl, { status: 303 })
}
