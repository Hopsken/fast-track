import 'server-only'

import { requiredEnv } from '../env/required'

export interface SupabaseServerEnv {
  supabaseSecretKey: string
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  return {
    supabaseSecretKey: requiredEnv(
      'SUPABASE_SECRET_KEY',
      process.env.SUPABASE_SECRET_KEY
    )
  }
}
