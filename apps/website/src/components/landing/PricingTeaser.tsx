import { Button } from '@internal/ui/components/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

import {
  CHROME_WEB_STORE_URL,
  freeFeatures,
  proFeatures
} from '../../lib/pricing'
import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

export async function PricingTeaser() {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const isSignedIn = Boolean(user)

  return (
    <section className="border-t border-stone-200/60 bg-[#FDFBF9] py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Free to start
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Try the faster way to use Jira.
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-stone-600 sm:text-[15px]">
              Search faster, act faster, and get 3 templates free.
            </p>

            <ul className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-sm text-stone-700">
              {freeFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 flex-none text-stone-900"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-xl text-sm leading-6 text-stone-600">
              Pro is for repeat work. The core product stays free.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-900 px-6 text-white shadow-none hover:bg-stone-800">
                <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                  Add to Chrome
                </a>
              </Button>

              <Link
                href="/pricing"
                className="inline-flex items-center text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900">
                See what Pro adds
              </Link>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Pro
            </p>
            <div className="mt-3 flex items-end gap-2">
              <h3 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
                $29
              </h3>
              <span className="pb-1 text-sm font-medium text-stone-500">
                / year
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              Best if you create repeat tickets every week.
            </p>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-stone-700">
              {proFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 flex-none text-stone-900"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              {isSignedIn ? (
                <form action="/api/billing/checkout" method="post">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-full bg-stone-900 text-white shadow-none hover:bg-stone-800">
                    Upgrade to Pro
                  </Button>
                </form>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full bg-stone-900 text-white shadow-none hover:bg-stone-800">
                  <Link href="/login">Sign in to upgrade</Link>
                </Button>
              )}

              <p className="mt-3 text-xs leading-5 text-stone-500">
                One paid plan. No tiers or feature bundles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
