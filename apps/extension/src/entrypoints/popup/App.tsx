import { useLayoutEffect, useRef } from 'react'
import { Button } from '@internal/ui/components/button'
import { Command, CommandInput } from '@internal/ui/components/command'
import { cn } from '@internal/ui/lib/utils'
import { useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  CommandRoute,
  CommandRouter,
  useCommandRouter
} from '@/components/CommandRouter'
import { QueryClientProvider } from '@/components/QueryClientProvider'
import { useAuthConfigurationStatus } from '@/hooks/useAuthConfigurationStatus'
import { useIsCommandLoading } from '@/stores/useLoadingStore'

import {
  CommandRoutes,
  TicketActionsMenu,
  TicketAssignMenu,
  TicketPriorityMenu,
  TicketStatusMenu
} from './menus'
import { EmptyAuthNotice } from './menus/EmptyAuthNotice'
import { Footer } from './menus/Footer'
import { TicketListMenu } from './menus/TicketListMenu'

function App() {
  const {
    activePage,
    activeSearch,
    activeValue,
    history,
    setSearch,
    setValue,
    pop
  } = useCommandRouter()
  const isAuthConfigured = useAuthConfigurationStatus()
  const inputRef = useRef<HTMLInputElement>(null)
  const isCommandLoading = useIsCommandLoading()

  const isSearchResultPage = activePage.path === '/'
  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-5 pr-5 border-b-2 border-gray-200',
    isCommandLoading && 'command-input-loading'
  )

  const onCommandInputChange = useMemoizedFn((value: string) => {
    setSearch(value)
  })

  const previousPageButton =
    history.length > 1 ? (
      <Button variant={'secondary'} size={'icon-xs'} onClick={() => pop()}>
        <ArrowLeft />
      </Button>
    ) : null

  useHotkeys(
    'esc',
    () => {
      if (activeSearch) {
        // clear input value when esc is pressed
        onCommandInputChange('')
      } else if (history.length === 1) {
        // close popup when esc is pressed on root page and input value is empty
        window.close()
      } else {
        // pop to previous page when esc is pressed on other pages and input value is empty
        pop()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: true
    }
  )

  // Focus input when active page changes
  useLayoutEffect(() => {
    inputRef?.current?.focus()
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.select()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [activePage.path])

  return (
    <div className="linear w-xl">
      <Command
        loop
        shouldFilter={!isSearchResultPage}
        value={activeValue}
        onValueChange={setValue}>
        <div className={inputContainerClassName}>
          {previousPageButton}
          <CommandInput
            autoFocus
            ref={inputRef}
            value={activeSearch}
            onValueChange={onCommandInputChange}
            placeholder={'Search tickets...'}
            aria-label="Search tickets"
            aria-busy={isCommandLoading}
          />
        </div>

        <CommandRoute path="/">
          {() => {
            if (isAuthConfigured === null) return null
            return isAuthConfigured ? <TicketListMenu /> : <EmptyAuthNotice />
          }}
        </CommandRoute>

        <CommandRoute path="/actions">
          {(ticket) => <TicketActionsMenu ticket={ticket} />}
        </CommandRoute>

        <CommandRoute path="/ticket/assign">
          {(ticket) => <TicketAssignMenu ticket={ticket} />}
        </CommandRoute>

        <CommandRoute path="/ticket/status">
          {(ticket) => <TicketStatusMenu ticket={ticket} />}
        </CommandRoute>

        <CommandRoute path="/ticket/priority">
          {(ticket) => <TicketPriorityMenu ticket={ticket} />}
        </CommandRoute>

        <Footer />
      </Command>
    </div>
  )
}

function AppWithProviders() {
  return (
    <QueryClientProvider>
      <CommandRouter<CommandRoutes> defaultPage="/">
        <App />
      </CommandRouter>
    </QueryClientProvider>
  )
}

export default AppWithProviders
