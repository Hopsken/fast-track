'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { AlertTriangle } from 'lucide-react'

import { createSupabaseBrowserClient } from '../../lib/supabase/browser'
import { getSupabasePublicEnv } from '../../lib/supabase/env'
import type { LoginError } from '../../lib/supabase/login-errors'
import { buildAuthCallbackUrl } from '../../lib/supabase/redirect-url'

const supabase = createSupabaseBrowserClient()

export function LoginPanel({
  error,
  next
}: {
  error?: LoginError | null
  next?: string | null
}) {
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

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{error.title}</p>
              {error.description ? (
                <p className="mt-1 text-sm text-amber-900/80">
                  {error.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Auth
        supabaseClient={supabase}
        view="magic_link"
        providers={['google']}
        redirectTo={buildAuthCallbackUrl(websiteUrl, next)}
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
