import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

import { getSupabasePublicEnv } from './src/lib/supabase/env'
import { hasSupabaseAuthCookies } from './src/lib/supabase/auth-cookies'
import { isProtectedPath } from './src/lib/supabase/protected-routes'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const shouldCheckUser =
    isProtectedPath(pathname) || hasSupabaseAuthCookies(request.cookies.getAll())

  if (!shouldCheckUser) return NextResponse.next()

  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicEnv()

  const cookiesToSet: CookieToSet[] = []

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(newCookies: CookieToSet[]) {
        cookiesToSet.push(...newCookies)
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const response =
    isProtectedPath(pathname) && !user
      ? NextResponse.redirect(new URL('/login', request.url))
      : NextResponse.next()

  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
  ]
}
