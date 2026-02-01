import { useMemo } from 'react'
import { Command } from '@internal/ui/components/command'
import { Outlet, useLocation } from 'react-router-dom'

import { useCommandSearchState } from '@/stores/command/useCommandController'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { CommandSearch } from './CommandSearch'
import { Footer } from './Footer'

export function CommandLayout() {
  const { value, setValue } = useCommandInput()

  const { shouldFilter } = useCommandSearchState()

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
