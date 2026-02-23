import type { ReactNode } from 'react'
import { Button } from '@internal/ui/components/button'
import { CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'

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
  dateLine: string | null
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

  const renewsLabel = formatDate(subscription?.renews_at)
  const endsLabel = formatDate(subscription?.ends_at)

  // Keep to a single "next date" line, similar to the reference IA.
  let dateLine: string | null = null

  if (isPro) {
    if (status === 'cancelled' && endsLabel) {
      dateLine = `Cancels on ${endsLabel}`
    } else if (renewsLabel) {
      dateLine = `Next payment is on ${renewsLabel}`
    } else if (endsLabel) {
      dateLine = `Ends on ${endsLabel}`
    }
  }

  return {
    isPro,
    planName: isPro ? 'Pro' : 'Free',
    dateLine,
    portalUrl: subscription?.customer_portal_url ?? null
  }
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
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone-600">No active subscription.</p>

        <form action="/api/billing/checkout" method="post">
          <Button
            type="submit"
            variant="default"
            className="rounded-full bg-stone-900 px-6 text-white shadow-none hover:bg-stone-800">
            Upgrade to Pro
          </Button>
        </form>
      </div>
    )
  }

  if (!billing.portalUrl) {
    return (
      <p className="mt-7 text-sm text-stone-600">
        Subscription portal link will appear after the first webhook sync.
      </p>
    )
  }

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

  // keep query param parsing stable for future, even if we don't surface it in UI
  await searchParams

  const { data: subscription, error: subscriptionError } = await supabase
    .from('billing_subscriptions')
    .select('status, renews_at, ends_at, customer_portal_url, updated_at')
    .eq('user_id', user.id)
    .maybeSingle<SubscriptionRow>()

  const billing = getBillingSummary(subscriptionError ? null : subscription)

  return (
    <main className="min-h-dvh bg-[#FDFBF9]">
      <div className="container mx-auto max-w-2xl px-6 py-14">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
              Account
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Signed in as{' '}
              <span className="font-medium text-stone-900">{user.email}</span>
            </p>
          </div>

          <form action="/auth/signout" method="post" className="shrink-0">
            <Button
              type="submit"
              variant="outline"
              className="rounded-full border-stone-300 bg-white px-5 text-stone-900 hover:bg-stone-50">
              Sign out
            </Button>
          </form>
        </header>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
                {billing.planName}
              </h2>

              {billing.dateLine ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  {billing.dateLine}
                </p>
              ) : null}
            </div>

            {billing.isPro ? (
              <div className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
                Pro
              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                Free
              </div>
            )}
          </div>

          {renderSubscriptionActions({
            billing,
            subscriptionError: Boolean(subscriptionError)
          })}
        </section>
      </div>
    </main>
  )
}
