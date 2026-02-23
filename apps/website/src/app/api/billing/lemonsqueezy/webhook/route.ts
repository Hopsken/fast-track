import { NextRequest } from 'next/server'

import { getLemonSqueezyEnv } from '../../../../../lib/billing/lemonsqueezy/env.server'
import {
  getWebhookSignature,
  verifyLemonSqueezyWebhookSignature
} from '../../../../../lib/billing/lemonsqueezy/webhook-signature'
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin'

export const runtime = 'nodejs'

type LemonSqueezyWebhookPayload = {
  meta?: {
    event_name?: string
    custom_data?: Record<string, unknown>
    event_id?: string
  }
  data?: {
    id?: string
    type?: string
    attributes?: {
      status?: string
      renews_at?: string | null
      ends_at?: string | null
      customer_id?: number | string | null
      user_email?: string | null
      urls?: {
        customer_portal?: string | null
      } | null
    }
  }
}

function getSupabaseUserId(payload: LemonSqueezyWebhookPayload): string | null {
  const custom = payload.meta?.custom_data
  if (!custom) return null

  const value =
    (custom['supabase_user_id'] as string | undefined) ??
    (custom['user_id'] as string | undefined)

  if (!value) return null
  return String(value)
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = getWebhookSignature(request.headers)

  if (!signature) {
    return new Response('Missing webhook signature', { status: 400 })
  }

  const { webhookSecret } = getLemonSqueezyEnv()

  const isValid = verifyLemonSqueezyWebhookSignature({
    rawBody,
    signature,
    secret: webhookSecret
  })

  if (!isValid) {
    return new Response('Invalid webhook signature', { status: 401 })
  }

  const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload

  // Best-effort idempotency (only if Lemon includes an event id).
  const eventId = payload.meta?.event_id
  const supabase = createSupabaseAdminClient()

  if (eventId) {
    const { error } = await supabase
      .from('billing_webhook_events')
      .insert({ id: eventId })

    // If already processed, return early.
    if (error && !String(error.code).includes('23505')) {
      // If we can't write idempotency rows, still proceed to update subscription.
    }

    if (!error) {
      // newly inserted, continue
    } else if (String(error.code).includes('23505')) {
      return new Response('ok', { status: 200 })
    }
  }

  const eventName = payload.meta?.event_name
  const isSubscriptionEvent = eventName?.startsWith('subscription_') ?? false

  if (!isSubscriptionEvent) {
    return new Response('ignored', { status: 200 })
  }

  const userId = getSupabaseUserId(payload)
  if (!userId) {
    return new Response('Missing custom_data.supabase_user_id', { status: 400 })
  }

  const status = payload.data?.attributes?.status ?? 'unknown'
  const renewsAt = payload.data?.attributes?.renews_at ?? null
  const endsAt = payload.data?.attributes?.ends_at ?? null
  const subscriptionId = payload.data?.id ?? null
  const customerId = payload.data?.attributes?.customer_id
    ? String(payload.data.attributes.customer_id)
    : null
  const customerPortalUrl =
    payload.data?.attributes?.urls?.customer_portal ?? null

  const { error: upsertError } = await supabase
    .from('billing_subscriptions')
    .upsert(
      {
        user_id: userId,
        lemonsqueezy_subscription_id: subscriptionId,
        lemonsqueezy_customer_id: customerId,
        status,
        renews_at: renewsAt,
        ends_at: endsAt,
        customer_portal_url: customerPortalUrl,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    return new Response('Failed to persist subscription', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
