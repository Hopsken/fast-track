import { useCreation } from 'ahooks'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { CommandFooter, NavigationProvider } from '@/common/commands'
import { EmptyAuthNotice } from '@/components/EmptyAuthNotice'
import { QueryClientProvider } from '@/components/QueryClientProvider'
import { HotkeysProvider } from '@/lib/hotkeys'
import { trackEvent } from '@/services/analytics'
import {
  UserContextProvider,
  useIsAuthConfigured
} from '@/stores/useCurrentUser'
import { UserPreferencesProvider } from '@/stores/useUserPreferences'

import { MainMenu } from './menus/MainMenu'

function App() {
  return (
    <div className="linear w-xl">
      <NavigationProvider>
        <MainMenu />
      </NavigationProvider>
      <CommandFooter />
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <UserPreferencesProvider>
      <HotkeysProvider>
        <App />
      </HotkeysProvider>
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
        <MemoryRouter>
          <AppRouter />
        </MemoryRouter>
      </UserContextProvider>
    </QueryClientProvider>
  )
}

export default AppWithProviders
