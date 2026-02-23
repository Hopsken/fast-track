import { Button } from '@internal/ui/components/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

export default async function AccountPage() {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
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
        </div>
      </div>
    </main>
  )
}
