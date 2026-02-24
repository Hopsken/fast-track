import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseRouteHandlerClient } from '../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next')

  if (error) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', errorDescription ?? error)
    if (next) loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const loginUrl = new URL('/login', url.origin)
    if (next) loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createSupabaseRouteHandlerClient()
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const loginUrl = new URL('/login', url.origin)
    loginUrl.searchParams.set('error', 'exchange_code_for_session_failed')
    if (next) loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  const { sanitizeNextPath } = await import(
    '../../../lib/supabase/redirect-url'
  )
  const safeNext = sanitizeNextPath(next)

  return NextResponse.redirect(new URL(safeNext ?? '/account', url.origin))
}
