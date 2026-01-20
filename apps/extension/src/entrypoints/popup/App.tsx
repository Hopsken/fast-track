import { useLayoutEffect, useRef } from 'react'
import { Button } from '@internal/ui/components/button'
import { Command, CommandInput } from '@internal/ui/components/command'
import { cn } from '@internal/ui/lib/utils'
import { useCreation, useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  CommandRoute,
  CommandRouter,
  useCommandRouter
} from '@/components/CommandRouter'
import { EmptyAuthNotice } from '@/components/EmptyAuthNotice'
import { QueryClientProvider } from '@/components/QueryClientProvider'
import { trackEvent } from '@/services/analytics'
import {
  UserContextProvider,
  useIsAuthConfigured
} from '@/stores/useCurrentUser'
import { useIsCommandLoading } from '@/stores/useLoadingStore'
import { UserPreferencesProvider } from '@/stores/useUserPreferences'

import {
  TicketActionsMenu,
  TicketAssignMenu,
  TicketMergeRequestsMenu,
  TicketPriorityMenu,
  TicketStatusMenu,
  TicketDetailsMenu,
  MainMenu
} from './menus'
import { Footer } from './menus/Footer'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const isCommandLoading = useIsCommandLoading()

  const isSearchResultPage =
    activePage.path === '/' && !activeSearch.startsWith('/')
  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b-2 border-gray-200',
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
          <MainMenu />
        </CommandRoute>

        <CommandRoute path="/ticket/actions">
          {(props) => <TicketActionsMenu {...props} />}
        </CommandRoute>

        <CommandRoute path="/ticket/assign">
          {(props) => <TicketAssignMenu {...props} />}
        </CommandRoute>

        <CommandRoute path="/ticket/merge-requests">
          {(props) => <TicketMergeRequestsMenu {...props} />}
        </CommandRoute>

        <CommandRoute path="/ticket/status">
          {(props) => <TicketStatusMenu {...props} />}
        </CommandRoute>

        <CommandRoute path="/ticket/priority">
          {(props) => <TicketPriorityMenu {...props} />}
        </CommandRoute>

        <CommandRoute path="/ticket/details">
          {(props) => <TicketDetailsMenu {...props} />}
        </CommandRoute>

        <Footer />
      </Command>
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <UserPreferencesProvider>
      <CommandRouter defaultPage="/">
        <App />
      </CommandRouter>
    </UserPreferencesProvider>
  )
}

function AppRouter() {
  const isAuthConfigured = useIsAuthConfigured()

  if (isAuthConfigured == null) {
    return null
  }

  if (!isAuthConfigured) {
    return <EmptyAuthNotice />
  }

  return <AuthenticatedApp />
}

function AppWithProviders() {
  useCreation(() => {
    trackEvent('open-popup')
  }, [])

  return (
    <QueryClientProvider>
      <UserContextProvider>
        <AppRouter />
      </UserContextProvider>
    </QueryClientProvider>
  )
}

export default AppWithProviders
