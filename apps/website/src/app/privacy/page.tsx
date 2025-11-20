import Link from 'next/link'

export const metadata = {
  description:
    'How Fast Track handles data, browser permissions, and Jira access.',
  title: 'Privacy Policy | Fast Track'
}

const sections = [
  {
    items: [
      'Jira content you search or open (issue keys, summaries, status).',
      'Account identifiers needed for Atlassian OAuth.',
      'Error and performance signals to keep the extension reliable.'
    ],
    title: 'Information we process'
  },
  {
    items: [
      'Search history and Jira responses stay on your device.',
      'Browser storage is scoped to the extension and never sold or shared.',
      'No advertising identifiers or cross-site tracking cookies are used.'
    ],
    title: 'How we store data'
  },
  {
    items: [
      'Encryption-in-transit for all Jira calls (HTTPS).',
      'Local-only caches that can be cleared from your browser settings.',
      'Minimal permissions: storage, tabs, and Atlassian host access.'
    ],
    title: 'Protection and security'
  },
  {
    items: [
      'Sign out or revoke the Jira token from your Atlassian account.',
      'Clear the extension storage to remove cached results.',
      'Contact us to delete diagnostic data if you shared it voluntarily.'
    ],
    title: 'Your choices'
  }
]

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-25%] left-[-10%] h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute top-1/4 right-[-10%] h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
              Privacy first
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl leading-tight font-semibold text-slate-900 sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="max-w-2xl text-lg text-slate-700">
                Fast Track is built to keep your Jira data confined to your
                browser. This page explains what we process, why, and how you
                stay in control.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:ring-emerald-400/60">
            Back home
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl ring-1 shadow-slate-200/80 ring-white/60 backdrop-blur">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg ring-1 shadow-slate-200/80 ring-white/60 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase ring-1 ring-amber-200">
              Last updated
            </p>
            <p className="text-sm text-slate-700">January 8, 2025</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
            We update this policy when we add features or refine data handling.
            Substantial changes are announced in release notes. If you have
            questions or need a data export, reach us anytime.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              href="mailto:support@teamusement.com">
              Contact support
            </a>
            <a
              className="text-sm font-medium text-sky-700 underline-offset-4 transition hover:text-sky-800 hover:underline"
              href="mailto:support@teamusement.com">
              support@teamusement.com
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
