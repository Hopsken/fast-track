import { useMemo } from 'react'
import { Command } from '@internal/ui/components/command'
import { Outlet, useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/useCommandInputStore'

import { CommandSearch } from './CommandSearch'
import { Footer } from './Footer'

const COMMAND_CHARS = ['/', '+']

export function CommandLayout() {
  const { value, search, setValue } = useCommandInput()
  const { pathname } = useLocation()

  const shouldFilter = useMemo(() => {
    if (pathname !== '/') return true
    return COMMAND_CHARS.some((char) => search.startsWith(char))
  }, [pathname, search])

  return (
    <Command
      loop
      shouldFilter={shouldFilter}
      value={value}
      onValueChange={setValue}>
      <CommandSearch />

      <Outlet />

      <Footer />
    </Command>
  )
}
