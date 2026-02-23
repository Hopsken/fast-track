import 'server-only'

export interface SupabaseServerEnv {
  supabaseSecretKey: string
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  return {
    supabaseSecretKey: required(
      'SUPABASE_SECRET_KEY',
      process.env.SUPABASE_SECRET_KEY
    )
  }
}
