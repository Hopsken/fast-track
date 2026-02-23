import { Button } from '@internal/ui/components/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

const included = [
  'Unlimited issue templates',
  'Sync (coming soon)',
  'All future Pro features',
  'Support development',
  'Cancel anytime'
]

export async function PricingTeaser() {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const isSignedIn = Boolean(user)

  return (
    <section className="border-t border-stone-200/60 bg-[#FDFBF9] py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-10 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Pro
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              $29 / year
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-stone-600">
              One plan. No tiers. If it ships, you get it.
            </p>

            <ul className="mt-7 flex flex-col gap-3 text-sm text-stone-700">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 flex-none text-emerald-700"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-stone-50 p-6 sm:p-7">
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
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            <p className="mt-3 text-center text-xs leading-5 text-stone-500">
              <Link href="/pricing" className="underline underline-offset-4">
                See details
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
