import { Button } from '@internal/ui/components/button'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

import { Header } from '../../components/landing/Header'

const includedFeatures = [
  'Unlimited issue templates',
  'Sync (coming soon)',
  'All future Pro features',
  'Support development',
  'Cancel anytime'
]

export const metadata: Metadata = {
  title: 'Pricing | Fast Track',
  description: 'One plan. $29/year. No bullshit.'
}

export default function PricingPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance font-serif text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
              Simple pricing.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-600">
              $29 per year. One plan. No tiers.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-stone-200 bg-white sm:mt-16 lg:flex">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
                Pro
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
                Unlock Pro inside Fast Track and keep it active as long as your
                subscription is active.
              </p>

              <div className="mt-8 flex items-center gap-x-4">
                <h3 className="flex-none text-xs font-semibold uppercase tracking-widest text-stone-900">
                  What you get
                </h3>
                <div className="h-px flex-auto bg-stone-100" />
              </div>

              <ul
                role="list"
                className="mt-6 flex flex-col gap-4 text-sm text-stone-700">
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      aria-hidden="true"
                      className="h-5 w-5 flex-none text-emerald-700"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2 lg:w-full lg:max-w-md lg:shrink-0">
              <div className="rounded-2xl bg-stone-50 px-8 py-10 text-center lg:flex lg:h-full lg:flex-col lg:justify-center lg:py-14">
                <p className="text-sm font-semibold text-stone-600">
                  Billed yearly
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="font-serif text-6xl font-semibold tracking-tight text-stone-900">
                    $29
                  </span>
                  <span className="text-sm font-semibold tracking-wide text-stone-600">
                    / year
                  </span>
                </p>

                <form
                  action="/api/billing/checkout"
                  method="post"
                  className="mt-10">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-full bg-stone-900 text-white shadow-none hover:bg-stone-800">
                    Upgrade to Pro
                  </Button>
                </form>

                <p className="mt-6 text-xs leading-5 text-stone-500">
                  You’ll sign in first. Receipts available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
