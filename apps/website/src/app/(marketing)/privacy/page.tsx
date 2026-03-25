import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  description:
    'How Fast Track handles data, browser permissions, and Jira access.',
  title: 'Privacy Policy | Fast Track'
}

const sections = [
  {
    title: 'What Fast Track accesses',
    body: [
      'Fast Track only accesses the Jira data it needs to help you find issues, open them, and take the next step.',
      'That includes issue details like keys, summaries, and status, plus the account details needed to sign in with Atlassian.'
    ],
    items: [
      'Issue details used for search and quick actions.',
      'Account details needed to complete Atlassian sign-in.',
      'Basic diagnostics used to fix reliability problems.'
    ]
  },
  {
    title: 'What stays on your device',
    body: [
      'Search history, cached Jira responses, and similar working data stay in browser storage used by the extension.',
      'Fast Track does not use advertising trackers, cross-site tracking cookies, or sell your activity data.'
    ],
    items: [
      'No advertising IDs or third-party tracking cookies.',
      'No selling or sharing of your extension activity data.',
      'Cached data can be cleared from your browser settings at any time.'
    ]
  },
  {
    title: 'Security and permissions',
    body: [
      'All Jira requests use HTTPS, and the extension asks for the minimum browser permissions it needs to work inside Jira.',
      'We keep the permission set narrow so the extension can stay useful without reading more than it needs.'
    ],
    items: [
      'Browser permissions are limited to storage, tabs, and Atlassian host access.',
      'Local caches exist to keep Fast Track fast, not to build a profile of your work.',
      'If you send logs or screenshots to support, we only use them to investigate that issue.'
    ]
  },
  {
    title: 'Your choices and contact',
    body: [
      'You can sign out, revoke access in Atlassian, and clear extension storage whenever you want.',
      'If you have a privacy question or want support to delete diagnostics you shared, email us directly.'
    ],
    items: [
      'Sign out of Fast Track or revoke access in Atlassian.',
      'Clear local extension data from your browser settings.',
      'Email support with privacy questions or deletion requests.'
    ]
  }
] as const

export default function PrivacyPage() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Privacy
          </p>
          <h1 className="mt-4 text-balance font-serif text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            Private by default.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-stone-600">
            Fast Track helps you move through Jira faster without turning your
            work into another dataset.
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-stone-600 sm:text-lg">
            Here is what the extension accesses, what stays local, and what
            control you keep over sign-in, search, and diagnostics.
          </p>
        </div>

        <div className="mt-16 border-t border-stone-200 pt-10 sm:mt-20">
          <div className="space-y-12 sm:space-y-14">
            {sections.map((section) => (
              <section
                key={section.title}
                className="grid gap-6 border-t border-stone-200 pt-8 sm:gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                <div>
                  <h2 className="text-balance font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                    {section.title}
                  </h2>
                </div>

                <div className="max-w-2xl">
                  <div className="space-y-4 text-sm leading-7 text-stone-600 sm:text-[15px]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-700 sm:text-[15px]">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-stone-900"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="mt-16 border-t border-stone-200 pt-6 sm:mt-20">
          <p className="text-sm leading-6 text-stone-500">
            Last updated: March 25, 2026
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-[15px]">
            We update this page when product changes affect what data the
            extension uses or how it handles it. Questions? Email{' '}
            <Link
              href="mailto:support@fast-track.work"
              className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900">
              support@fast-track.work
            </Link>
            .
          </p>
        </section>
      </div>
    </section>
  )
}
