'use client'

import { Button } from '@internal/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@internal/ui/components/popover'
import { Separator } from '@internal/ui/components/separator'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'

type HeaderUser = {
  email: string
  avatarUrl?: string
}

function initialFromEmail(email: string): string {
  const trimmed = email.trim()
  if (!trimmed) return 'U'
  return trimmed[0]!.toUpperCase()
}

export function HeaderUserMenu({ user }: { user: HeaderUser }) {
  const initial = initialFromEmail(user.email)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Account menu"
          className="group rounded-full border-stone-300 bg-white/60 pl-2 pr-3 text-stone-900 shadow-none hover:bg-white hover:text-stone-900">
          <span className="flex items-center gap-2">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-200"
              />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-[11px] font-semibold text-white">
                {initial}
              </span>
            )}
            <span className="hidden max-w-[160px] truncate text-sm font-medium sm:inline">
              {user.email}
            </span>
            <ChevronDown className="h-4 w-4 text-stone-500 transition group-hover:text-stone-700" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-2xl border-stone-200 bg-white p-2 text-stone-900 shadow-[0_22px_60px_-44px_rgba(0,0,0,0.55)]">
        <div className="px-2 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Signed in
          </p>
          <p className="mt-1 truncate text-sm font-medium text-stone-900">
            {user.email}
          </p>
        </div>

        <Separator className="my-1 bg-stone-200" />

        <div className="grid gap-1">
          <Button
            asChild
            variant="ghost"
            className="h-9 justify-start rounded-xl px-3 text-stone-700 hover:bg-stone-100 hover:text-stone-900">
            <Link href="/account">
              <UserRound className="h-4 w-4" />
              Account
            </Link>
          </Button>

          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="h-9 w-full justify-start rounded-xl px-3 text-stone-700 hover:bg-stone-100 hover:text-stone-900">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
