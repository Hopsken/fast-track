import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getSupabasePublicEnv } from './env'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function createSupabaseServerClientReadOnly() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicEnv()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      // Server Components can't set cookies. Session refresh handled in middleware.
      setAll() {
        /* noop */
      }
    }
  })
}

export async function createSupabaseRouteHandlerClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicEnv()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options)
        }
      }
    }
  })
}
