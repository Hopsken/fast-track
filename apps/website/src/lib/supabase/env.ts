export interface SupabasePublicEnv {
  supabaseUrl: string
  supabasePublishableKey: string
  websiteUrl: string
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    supabaseUrl: required(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    supabasePublishableKey: required(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    websiteUrl: required(
      'NEXT_PUBLIC_WEBSITE_URL',
      process.env.NEXT_PUBLIC_WEBSITE_URL
    )
  }
}
