import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { Command, CommandInput } from '@internal/ui/components/command'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  CommandRoute,
  CommandRouter,
  useCommandRouter
} from '@/components/CommandRouter'
import { ticketService } from '@/services'
import { useTicketSearch } from '~/hooks/useTicketSearch'

import {
  CommandRoutes,
  SearchResultMenu,
  TicketActionsMenu,
  TicketAssignMenu,
  TicketPriorityMenu,
  TicketStatusMenu
} from './menus'
import { Footer } from './menus/Footer'

function App() {
  const router = useCommandRouter()
  const { handleSearch, isSearching, error, isAuthConfigured } =
    useTicketSearch()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const footerError = isAuthConfigured ? error : undefined

  // Initialize search orchestration
  useEffect(() => {
    ticketService.suggestions.refresh('startup')
  }, [])

  const isSearchResultPage = router.activePage.path === '/'

  const onCommandInputChange = useMemoizedFn((value: string) => {
    setInputValue(value)
    if (isSearchResultPage) {
      handleSearch(value)
    }
  })

  const previousPageButton =
    router.pages.length > 1 ? (
      <Button
        variant={'secondary'}
        size={'icon-xs'}
        onClick={() => router.pop()}>
        <ArrowLeft />
      </Button>
    ) : null

  useHotkeys(
    'esc',
    () => {
      if (inputValue) {
        // clear input value when esc is pressed
        onCommandInputChange('')
      } else if (router.pages.length === 1) {
        // close popup when esc is pressed on root page and input value is empty
        window.close()
      } else {
        // pop to previous page when esc is pressed on other pages and input value is empty
        router.pop()
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
  }, [router.activePage.path])

  return (
    <div className="linear w-lg">
      <Command loop shouldFilter>
        <div className="relative flex h-[52px] items-center gap-3 border-b border-gray-200 pl-5 pr-5">
          {previousPageButton}
          <CommandInput
            autoFocus
            ref={inputRef}
            value={inputValue}
            onValueChange={onCommandInputChange}
            placeholder={isSearching ? 'Searching...' : 'Search tickets...'}
            aria-label="Search tickets"
            aria-busy={isSearching}
          />
        </div>

        <CommandRoute path="/">
          <SearchResultMenu />
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

        <Footer error={footerError} />
      </Command>
    </div>
  )
}

function AppWithProviders() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <CommandRouter<CommandRoutes> defaultPage="/">
        <App />
      </CommandRouter>
    </QueryClientProvider>
  )
}

export default AppWithProviders
