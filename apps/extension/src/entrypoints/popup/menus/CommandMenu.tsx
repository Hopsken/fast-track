import { useMemo } from 'react'
import { Command } from '@internal/ui/components/command'
import { Outlet, useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/useCommandInputStore'

import { CommandSearch } from './CommandSearch'
import { Footer } from './Footer'

const COMMAND_CHARS = ['/', '+']

export function CommandMenu() {
  const { value, search, setValue } = useCommandInput()
  const { key: locationKey } = useLocation()

  const shouldFilter = useMemo(() => {
    if (locationKey !== '/') return true
    return COMMAND_CHARS.some((char) => search.startsWith(char))
  }, [locationKey, search])

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
