import { Command } from '@internal/ui/components/command'
import { Outlet } from 'react-router-dom'

import { HotkeysScopeProvider } from '@/lib/hotkeys'
import { useCommandSearchState } from '@/stores/command/useCommandController'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { CommandSearch } from './CommandSearch'
import { Footer } from './Footer'

export function CommandLayout() {
  const { value, setValue } = useCommandInput()
  const { shouldFilter } = useCommandSearchState()

  return (
    <HotkeysScopeProvider scope="global">
      <Command
        loop
        shouldFilter={shouldFilter}
        value={value}
        onValueChange={setValue}>
        <CommandSearch />

        <Outlet />

        <Footer />
      </Command>
    </HotkeysScopeProvider>
  )
}
