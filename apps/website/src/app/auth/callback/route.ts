import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseRouteHandlerClient } from '../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, url.origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createSupabaseRouteHandlerClient()
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      new URL('/login?error=exchange_code_for_session_failed', url.origin)
    )
  }

  return NextResponse.redirect(new URL('/account', url.origin))
}
