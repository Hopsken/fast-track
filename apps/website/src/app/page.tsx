import Link from 'next/link'

export const metadata = {
  description:
    'Fast Track helps you search, open, and manage Jira issues without breaking flow.',
  title: 'Fast Track | Jira, without the drag'
}

const highlights = [
  'Lightning search by key, summary, assignee, or status.',
  'Open tickets directly from the omnibox or keyboard.',
  'Board-friendly view with filters you actually use.',
  'Built for privacy—your Jira data stays on-device.'
]

export default function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[-25%] h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute right-[-8%] top-1/3 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/4 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-16 pt-20 sm:pt-28">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40">
              FT
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Fast Track
              </p>
              <p className="text-xs text-slate-600">Jira, without the drag</p>
            </div>
          </div>
          <Link
            href="/privacy"
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:ring-emerald-400/60">
            Privacy
          </Link>
        </header>

        <section className="mt-16 grid gap-12 sm:grid-cols-[1.1fr_0.9fr] sm:items-start">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
              Instant issue access
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Your Jira workbench, ready in a keystroke
              </h1>
              <p className="text-lg text-slate-700">
                Search, open, and triage tickets faster with a privacy-first
                browser extension. No more tab-hopping or page reloads.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                href="mailto:support@teamusement.com">
                Request early access
              </a>
              <Link
                href="/privacy"
                className="text-sm font-semibold text-sky-700 underline-offset-4 transition hover:text-sky-800 hover:underline">
                See how we handle data
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 ring-1 ring-white/60 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              Why Fast Track
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              Built for teams that live in Jira. Works with your Atlassian SSO,
              keeps search cached locally, and stays out of your way.
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
