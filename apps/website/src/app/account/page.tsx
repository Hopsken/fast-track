import { Button } from '@internal/ui/components/button'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
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

  const { data: subscription } = await supabase
    .from('billing_subscriptions')
    .select('status, renews_at, ends_at, customer_portal_url, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const isPro = isProFromSubscription(
    subscription
      ? {
          status: subscription.status,
          endsAt: subscription.ends_at
        }
      : null
  )

  const renewsAtLabel = formatDate(subscription?.renews_at)
  const endsAtLabel = formatDate(subscription?.ends_at)

  const showCheckoutSuccess = checkout === 'success'
  const showCheckoutCancel = checkout === 'cancel'

  return (
    <main className="min-h-dvh bg-[#FDFBF9]">
      <div className="container mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
          Account
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Signed in as{' '}
          <span className="font-medium text-stone-900">{user.email}</span>
        </p>

        {showCheckoutSuccess ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Payment complete</p>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Your subscription will activate shortly (webhook sync).
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {showCheckoutCancel ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Checkout cancelled</p>
                <p className="mt-1 text-sm text-amber-900/80">
                  No worries — you can upgrade anytime.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-serif text-xl font-semibold tracking-tight text-stone-900">
                  Pro
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Annual subscription — $29/year
                </p>
              </div>

              {isPro ? (
                <span className="inline-flex items-center rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                  Pro Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  Free
                </span>
              )}
            </div>

            {isPro ? (
              <div className="mt-6 grid gap-3 text-sm text-stone-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-stone-500">Status</span>
                  <span className="font-medium text-stone-900">
                    {subscription?.status ?? 'unknown'}
                  </span>
                </div>
                {renewsAtLabel ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-stone-500">Renews</span>
                    <span className="font-medium text-stone-900">
                      {renewsAtLabel}
                    </span>
                  </div>
                ) : null}
                {endsAtLabel ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-stone-500">Ends</span>
                    <span className="font-medium text-stone-900">
                      {endsAtLabel}
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {subscription?.customer_portal_url ? (
                    <Button asChild variant="outline" className="rounded-full">
                      <a
                        href={subscription.customer_portal_url}
                        target="_blank"
                        rel="noreferrer">
                        Manage subscription
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-stone-500">
                      Manage link will appear once the first webhook sync is
                      received.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-stone-600">
                  Unlock Pro features across the product.
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
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <dl className="grid gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  User ID
                </dt>
                <dd className="mt-1 font-mono text-sm text-stone-900">
                  {user.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Provider
                </dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {user.app_metadata?.provider ?? 'unknown'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/">Home</Link>
              </Button>

              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="default"
                  className="rounded-full bg-stone-900 px-6 text-white shadow-none hover:bg-stone-800">
                  Sign out
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
