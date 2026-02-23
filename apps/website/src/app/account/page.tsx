import type { ReactNode } from 'react'
import { Button } from '@internal/ui/components/button'
import { CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Header } from '../../components/landing/Header'
import { isProFromSubscription } from '../../lib/billing/subscription'
import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

type AccountSearchParams = Promise<{
  checkout?: string
}>

type SubscriptionRow = {
  status: string
  renews_at: string | null
  ends_at: string | null
  customer_portal_url: string | null
  updated_at: string
}

type BillingSummary = {
  isPro: boolean
  planName: 'Pro' | 'Free'
  nextRenewLabel: string | null
  cancelsLabel: string | null
  portalUrl: string | null
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getBillingSummary(
  subscription: SubscriptionRow | null
): BillingSummary {
  const status = subscription?.status ?? 'unknown'

  const isPro = isProFromSubscription(
    subscription
      ? {
          status,
          endsAt: subscription.ends_at
        }
      : null
  )

  const nextRenewLabel = formatDate(subscription?.renews_at)
  const cancelsLabel =
    status === 'cancelled' ? formatDate(subscription?.ends_at) : null

  return {
    isPro,
    planName: isPro ? 'Pro' : 'Free',
    nextRenewLabel,
    cancelsLabel,
    portalUrl: subscription?.customer_portal_url ?? null
  }
}

function renderNextDateLine(billing: BillingSummary): ReactNode {
  if (!billing.isPro) return null

  if (billing.cancelsLabel) {
    return (
      <p className="flex items-center gap-2 text-sm text-stone-600">
        <CalendarDays aria-hidden="true" className="h-4 w-4" />
        Cancels on {billing.cancelsLabel}
      </p>
    )
  }

  if (billing.nextRenewLabel) {
    return (
      <p className="flex items-center gap-2 text-sm text-stone-600">
        <CalendarDays aria-hidden="true" className="h-4 w-4" />
        Next renewal is on {billing.nextRenewLabel}
      </p>
    )
  }

  return null
}

function renderSubscriptionActions(options: {
  billing: BillingSummary
  subscriptionError: boolean
}): ReactNode {
  const { billing, subscriptionError } = options

  if (subscriptionError) {
    return (
      <p className="mt-6 text-sm text-stone-700">
        We couldn’t load your subscription right now. Please try again later.
      </p>
    )
  }

  if (!billing.isPro) {
    return (
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone-600">No active subscription.</p>

        <form action="/api/billing/checkout" method="post">
          <Button
            type="submit"
            variant="default"
            className="rounded-full bg-stone-900 px-6 text-white shadow-none hover:bg-stone-800">
            Upgrade
          </Button>
        </form>
      </div>
    )
  }

  if (!billing.portalUrl) {
    return (
      <p className="mt-8 text-sm text-stone-600">
        Manage link will appear after the first webhook sync.
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button asChild variant="outline" className="rounded-full">
        <a href={billing.portalUrl} target="_blank" rel="noopener noreferrer">
          Manage subscription
        </a>
      </Button>

      <Button
        asChild
        variant="outline"
        className="rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
        <a href={billing.portalUrl} target="_blank" rel="noopener noreferrer">
          Cancel plan
        </a>
      </Button>
    </div>
  )
}

export default async function AccountPage({
  searchParams
}: {
  searchParams: AccountSearchParams
}) {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Keep query param parsing stable for future, even if we don't surface it in UI.
  await searchParams

  const { data: subscription, error: subscriptionError } = await supabase
    .from('billing_subscriptions')
    .select('status, renews_at, ends_at, customer_portal_url, updated_at')
    .eq('user_id', user.id)
    .maybeSingle<SubscriptionRow>()

  const billing = getBillingSummary(subscriptionError ? null : subscription)

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="container mx-auto max-w-2xl px-6 py-14">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
              {billing.planName}
            </h2>

            {renderNextDateLine(billing)}

            <div className="mt-2 border-t border-dashed border-stone-200 pt-6">
              {renderSubscriptionActions({
                billing,
                subscriptionError: Boolean(subscriptionError)
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
