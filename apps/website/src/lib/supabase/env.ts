import { requiredEnv } from '../env/required'

export interface SupabasePublicEnv {
  supabaseUrl: string
  supabasePublishableKey: string
  websiteUrl: string
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    supabaseUrl: requiredEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    supabasePublishableKey: requiredEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    websiteUrl: requiredEnv(
      'NEXT_PUBLIC_WEBSITE_URL',
      process.env.NEXT_PUBLIC_WEBSITE_URL
    )
  }
}
