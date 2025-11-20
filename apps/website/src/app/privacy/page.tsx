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
        <div className="absolute left-[-10%] top-[-25%] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-1/4 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200">
              Privacy first
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                Fast Track is built to keep your Jira data confined to your
                browser. This page explains what we process, why, and how you
                stay in control.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:ring-emerald-400/50"
          >
            Back home
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map(section => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur"
            >
              <h2 className="mb-4 text-xl font-semibold text-white">
                {section.title}
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-slate-200">
                {section.items.map(item => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-xl bg-slate-900/60 px-3 py-2 ring-1 ring-slate-800"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 ring-1 ring-white/5 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
              Last updated
            </p>
            <p className="text-sm text-slate-200">January 8, 2025</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
            We update this policy when we add features or refine data handling.
            Substantial changes are announced in release notes. If you have
            questions or need a data export, reach us anytime.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              href="mailto:support@teamusement.com"
            >
              Contact support
            </a>
            <a
              className="text-sm font-medium text-sky-300 underline-offset-4 transition hover:text-sky-200 hover:underline"
              href="mailto:support@teamusement.com"
            >
              support@teamusement.com
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
