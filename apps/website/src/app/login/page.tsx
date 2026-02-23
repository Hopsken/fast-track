import { Button } from '@internal/ui/components/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginPanel } from '../../components/auth/LoginPanel'
import { formatLoginError } from '../../lib/supabase/login-errors'
import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) redirect('/account')

  const { error } = await searchParams

  return (
    <main className="min-h-dvh bg-[#FDFBF9]">
      <div className="container mx-auto flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="mb-6 w-full max-w-sm">
          <Button
            asChild
            variant="ghost"
            className="-ml-2 rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900">
            <Link href="/">Back</Link>
          </Button>
        </div>

        <LoginPanel error={formatLoginError(error)} />
      </div>
    </main>
  )
}
