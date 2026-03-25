import { Button } from '@internal/ui/components/button'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

import { CHROME_WEB_STORE_URL, pricingPlans } from '../../../lib/pricing'

export const metadata: Metadata = {
  title: 'Pricing | Fast Track',
  description:
    'Use Fast Track for free to get through Jira faster. Upgrade to Pro when issue templates become part of your daily work.'
}

export default function PricingPage() {
  const freePlan = pricingPlans[0]
  const proPlan = pricingPlans[1]

  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Pricing
          </p>
          <h1 className="text-balance font-serif text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            Start getting through Jira faster for free.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-600">
            Upgrade when we save you enough time to matter.
          </p>
        </div>

        <div className="mt-14 grid gap-12 border-t border-stone-200 pt-10 sm:mt-16 lg:grid-cols-2 lg:gap-16">
          <article>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
              {freePlan.name}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
              {freePlan.description}
            </p>

            <ul
              role="list"
              className="mt-8 flex flex-col gap-4 border-t border-stone-200 pt-6 text-sm text-stone-700">
              {freePlan.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 flex-none text-stone-900"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              className="mt-10 h-12 rounded-full bg-stone-900 px-8 text-white shadow-none hover:bg-stone-800">
              <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">
                Add to Chrome free
              </a>
            </Button>
          </article>

          <article className="lg:border-l lg:border-stone-200 lg:pl-16">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
              {proPlan.name}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
              {proPlan.description}
            </p>

            <p className="mt-8 flex items-baseline gap-x-2">
              <span className="font-serif text-6xl font-semibold tracking-tight text-stone-900">
                {proPlan.price}
              </span>
              <span className="text-sm font-semibold tracking-wide text-stone-600">
                {proPlan.priceSuffix}
              </span>
            </p>

            <ul
              role="list"
              className="mt-8 flex flex-col gap-4 border-t border-stone-200 pt-6 text-sm text-stone-700">
              {proPlan.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 flex-none text-stone-900"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

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
          </article>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-4">
          <p className="text-xs leading-5 text-stone-500">
            No account needed. Sign in only to upgrade.
          </p>
        </div>
      </div>
    </section>
  )
}
