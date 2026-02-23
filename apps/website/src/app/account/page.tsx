import type { ReactNode } from 'react'
import { Button } from '@internal/ui/components/button'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { redirect } from 'next/navigation'

import { isProFromSubscription } from '../../lib/billing/subscription'
import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

type AccountSearchParams = Promise<{
  checkout?: string
}>

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

type SubscriptionRow = {
  status: string
  renews_at: string | null
  ends_at: string | null
  customer_portal_url: string | null
  updated_at: string
}

type BillingSummary = {
  isPro: boolean
  status: string
  statusLabel: string
  renewsLabel: string | null
  endsLabel: string | null
  portalUrl: string | null
  isCancelledButActive: boolean
}

function toStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'on_trial':
      return 'Trial'
    case 'cancelled':
      return 'Cancelled'
    case 'expired':
      return 'Expired'
    case 'past_due':
      return 'Payment issue'
    case 'unpaid':
      return 'Unpaid'
    default:
      return status || 'Unknown'
  }
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

  const isCancelledButActive =
    status === 'cancelled' && Boolean(endsLabel) && isPro

  return {
    isPro,
    status,
    statusLabel: toStatusLabel(status),
    renewsLabel,
    endsLabel,
    portalUrl: subscription?.customer_portal_url ?? null,
    isCancelledButActive
  }
}

function renderCheckoutBanner(checkout: string | undefined): ReactNode {
  if (checkout === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
        <div className="flex gap-3">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Payment complete</p>
            <p className="mt-1 text-sm text-emerald-900/80">
              Your plan updates after webhook sync (usually under a minute).
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (checkout === 'cancel') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
        <div className="flex gap-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Checkout cancelled</p>
            <p className="mt-1 text-sm text-amber-900/80">
              No charges were made.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function renderPlanBody(options: {
  subscriptionError: boolean
  billing: BillingSummary
}): ReactNode {
  const { subscriptionError, billing } = options

  if (subscriptionError) {
    return (
      <p className="mt-6 text-sm text-stone-700">
        We couldn’t load your billing status. Please try again later.
      </p>
    )
  }

  if (!billing.isPro) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone-600">
          Upgrade to Pro to unlock the full product.
        </p>

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

  const endsTitle = billing.isCancelledButActive ? 'Cancels on' : 'Ends'

  return (
    <div className="mt-6 grid gap-3 text-sm text-stone-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-stone-500">Status</span>
        <span className="font-medium text-stone-900">
          {billing.statusLabel}
        </span>
      </div>

      {billing.renewsLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-stone-500">Renews</span>
          <span className="font-medium text-stone-900">
            {billing.renewsLabel}
          </span>
        </div>
      ) : null}

      {billing.endsLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-stone-500">{endsTitle}</span>
          <span className="font-medium text-stone-900">
            {billing.endsLabel}
          </span>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {billing.portalUrl ? (
          <Button asChild className="rounded-full bg-stone-900 px-6">
            <a
              href={billing.portalUrl}
              target="_blank"
              rel="noopener noreferrer">
              Manage subscription
            </a>
          </Button>
        ) : (
          <p className="text-xs text-stone-500">
            Manage link will appear after the first webhook sync.
          </p>
        )}
      </div>
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

  const { checkout } = await searchParams

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

        {renderCheckoutBanner(checkout)}

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-900">
                Plan
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Pro is an annual subscription — $29/year.
              </p>
            </div>

            <span
              className={
                billing.isPro
                  ? 'inline-flex items-center rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white'
                  : 'inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700'
              }>
              {billing.isPro ? 'Pro' : 'Free'}
            </span>
          </div>

          {renderPlanBody({
            subscriptionError: Boolean(subscriptionError),
            billing
          })}

          <p className="mt-6 text-xs text-stone-500">
            Billing is handled by LemonSqueezy.
          </p>
        </section>
      </div>
    </main>
  )
}
