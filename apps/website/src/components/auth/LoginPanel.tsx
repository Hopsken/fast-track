'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

import { createSupabaseBrowserClient } from '../../lib/supabase/browser'
import { getSupabasePublicEnv } from '../../lib/supabase/env'
import { buildAuthCallbackUrl } from '../../lib/supabase/redirect-url'

const supabase = createSupabaseBrowserClient()

export function LoginPanel() {
  const { websiteUrl } = getSupabasePublicEnv()

  return (
    <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Magic link via email, or Google.
        </p>
      </div>

      <Auth
        supabaseClient={supabase}
        view="magic_link"
        providers={['google']}
        redirectTo={buildAuthCallbackUrl(websiteUrl)}
        showLinks={false}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#0c0a09',
                brandAccent: '#1c1917'
              }
            }
          },
          style: {
            button: {
              borderRadius: '9999px'
            },
            input: {
              borderRadius: '12px'
            }
          }
        }}
      />

      <p className="mt-5 text-xs leading-relaxed text-stone-500">
        By continuing you agree to our usage of authentication cookies.
      </p>
    </div>
  )
}
