import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { getSupabasePublicEnv } from './env'
import { getSupabaseServerEnv } from './env.server'

export function createSupabaseAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv()
  const { supabaseSecretKey } = getSupabaseServerEnv()

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}
