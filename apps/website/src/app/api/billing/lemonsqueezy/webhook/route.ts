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

type BillingSubscriptionUpsert = {
  user_id: string
  updated_at: string
  status?: string
  renews_at?: string | null
  ends_at?: string | null
  lemonsqueezy_subscription_id?: string
  lemonsqueezy_customer_id?: string
  customer_portal_url?: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
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

function isSubscriptionEvent(payload: LemonSqueezyWebhookPayload): boolean {
  const eventName = payload.meta?.event_name
  return eventName?.startsWith('subscription_') ?? false
}

function buildSubscriptionUpsertPayload(options: {
  payload: LemonSqueezyWebhookPayload
  userId: string
}): BillingSubscriptionUpsert {
  const { payload, userId } = options
  const attributes = payload.data?.attributes

  const upsertPayload: BillingSubscriptionUpsert = {
    user_id: userId,
    updated_at: new Date().toISOString()
  }

  if (isNonEmptyString(payload.data?.id)) {
    upsertPayload.lemonsqueezy_subscription_id = payload.data?.id
  }

  if (
    attributes?.customer_id !== undefined &&
    attributes.customer_id !== null
  ) {
    upsertPayload.lemonsqueezy_customer_id = String(attributes.customer_id)
  }

  if (isNonEmptyString(attributes?.status)) {
    upsertPayload.status = attributes.status
  }

  // We treat explicit `null` as authoritative; missing field stays untouched.
  if (attributes?.renews_at !== undefined) {
    upsertPayload.renews_at = attributes.renews_at
  }

  if (attributes?.ends_at !== undefined) {
    upsertPayload.ends_at = attributes.ends_at
  }

  // Don't overwrite an existing portal url with null/empty.
  const customerPortalUrl = attributes?.urls?.customer_portal
  if (isNonEmptyString(customerPortalUrl)) {
    upsertPayload.customer_portal_url = customerPortalUrl
  }

  return upsertPayload
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
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

  const payload = safeJsonParse<LemonSqueezyWebhookPayload>(rawBody)
  if (!payload) {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  if (!isSubscriptionEvent(payload)) {
    return new Response('ignored', { status: 200 })
  }

  const userId = getSupabaseUserId(payload)
  if (!userId) {
    return new Response('Missing custom_data.supabase_user_id', { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const upsertPayload = buildSubscriptionUpsertPayload({ payload, userId })

  const { error: upsertError } = await supabase
    .from('billing_subscriptions')
    .upsert(upsertPayload, { onConflict: 'user_id' })

  if (upsertError) {
    return new Response('Failed to persist subscription', { status: 500 })
  }

  // Best-effort idempotency marker.
  // Write only after the business update succeeds.
  const eventId = payload.meta?.event_id
  if (eventId) {
    const { error } = await supabase
      .from('billing_webhook_events')
      .insert({ id: eventId })

    if (error && !isUniqueViolation(error)) {
      // no-op
    }
  }

  return new Response('ok', { status: 200 })
}
