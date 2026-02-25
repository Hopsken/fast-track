import { useCallback, useMemo, useState } from 'react'
import { Badge } from '@internal/ui/components/badge'
import { Button } from '@internal/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@internal/ui/components/popover'
import { ExternalLink, Link2, LogOut } from 'lucide-react'
import { browser } from 'wxt/browser'

import { useStorage } from '@/hooks/useStorage'
import logoUrl from '~/assets/logo.png'
import { BOOST_WEBSITE_BASE_URL } from '~/lib/api'
import { getEntitlementService } from '~/services'

interface OptionsHeaderProps {
  version: string
}

function initialsFromEmail(email: string): string {
  const value = email.trim()
  if (!value) return '?'

  const at = value.indexOf('@')
  const name = at > 0 ? value.slice(0, at) : value

  const parts = name.split(/[._-]+/).filter(Boolean)
  let chars: string[]
  if (parts.length >= 2) {
    chars = [parts[0]?.[0] ?? '?', parts[1]?.[0] ?? '?']
  } else if (name.length > 0) {
    chars = [name[0] ?? '?']
  } else {
    chars = ['?']
  }

  return chars.join('').toUpperCase()
}

function PlanPill(props: { isPro: boolean; planLabel: 'Pro' | 'Free' }) {
  if (props.isPro) {
    return (
      <Badge className="rounded-full border border-gray-900 bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">
        {props.planLabel}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="rounded-full border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">
      {props.planLabel}
    </Badge>
  )
}

export function OptionsHeader({ version }: OptionsHeaderProps) {
  const [auth] = useStorage('ExtensionAuth')
  const [snapshot] = useStorage('SubscriptionSnapshot')

  const [isLinking, setIsLinking] = useState(false)

  const needsRelogin = auth?.state === 'relogin_required'

  const email = needsRelogin ? null : (auth?.user.email ?? null)
  const isPro = snapshot?.isPro ?? false

  const planLabel = useMemo(() => {
    if (!snapshot) return null
    return snapshot.isPro ? 'Pro' : 'Free'
  }, [snapshot])

  const avatar = useMemo(
    () => (email ? initialsFromEmail(email) : '?'),
    [email]
  )
  let signInTitle: string | undefined
  let signInLabel = 'Sign in'
  if (isLinking) {
    signInLabel = 'Opening…'
  } else if (needsRelogin) {
    signInTitle = 'Session expired. Sign in again to continue.'
    signInLabel = 'Sign in again'
  } else {
    signInTitle = undefined
  }

  const openLinkFlow = useCallback(async () => {
    setIsLinking(true)
    try {
      const url = await getEntitlementService().connect()
      await browser.tabs.create({ url })
    } finally {
      setIsLinking(false)
    }
  }, [])

  const openWebsiteAccount = useCallback(async () => {
    await browser.tabs.create({ url: `${BOOST_WEBSITE_BASE_URL}/account` })
  }, [])

  const openUpgrade = useCallback(async () => {
    await browser.tabs.create({
      url: `${BOOST_WEBSITE_BASE_URL}/api/billing/checkout`
    })
  }, [])

  const signOut = useCallback(async () => {
    const ok = window.confirm(
      'Sign out from Fast Track account in this extension?'
    )
    if (!ok) return
    await getEntitlementService().signOut()
  }, [])

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} className="h-12 w-12 rounded-xl" alt="Fast Track" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Fast Track</h1>
          </div>
          <p className="text-gray-600">v{version} Settings</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!email ? (
          <Button
            variant="outline"
            size="sm"
            onClick={openLinkFlow}
            disabled={isLinking}
            title={signInTitle}>
            <Link2 className="h-4 w-4" />
            {signInLabel}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {planLabel ? (
              <PlanPill isPro={isPro} planLabel={planLabel} />
            ) : null}

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-3 pr-1 text-xs font-medium text-gray-900 shadow-none transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                  aria-label="Account">
                  <span className="max-w-52 truncate text-gray-700">
                    {email}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-gray-900 to-gray-600 text-[11px] font-semibold text-white">
                    {avatar}
                  </span>
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-64 p-2">
                <div className="grid gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openWebsiteAccount}
                    className="justify-between">
                    Account & billing
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  {!isPro ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openUpgrade}
                      className="justify-between">
                      Upgrade
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ) : null}

                  <div className="my-1 h-px bg-gray-200" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="justify-between text-red-600/80 hover:text-red-700">
                    Sign out
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </header>
  )
}
