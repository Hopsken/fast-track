import { Button } from '@internal/ui/components/button'
import Link from 'next/link'

import { createSupabaseServerClientReadOnly } from '../../lib/supabase/server'

import { HeaderUserMenu } from './HeaderUserMenu'

export async function HeaderAuth() {
  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-full border-stone-300 bg-white/60 px-4 text-stone-900 shadow-none hover:bg-white hover:text-stone-900">
        <Link href="/login">Sign in</Link>
      </Button>
    )
  }

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined)

  return (
    <HeaderUserMenu
      user={{
        avatarUrl,
        email: user.email ?? 'Signed in'
      }}
    />
  )
}
