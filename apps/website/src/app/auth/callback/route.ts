import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseRouteHandlerClient } from '../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', errorDescription ?? error)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createSupabaseRouteHandlerClient()
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', 'exchange_code_for_session_failed')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(new URL('/account', url.origin))
}
