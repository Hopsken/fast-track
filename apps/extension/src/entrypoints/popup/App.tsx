import { useCreation } from 'ahooks'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { EmptyAuthNotice } from '@/components/EmptyAuthNotice'
import { QueryClientProvider } from '@/components/QueryClientProvider'
import { trackEvent } from '@/services/analytics'
import {
  UserContextProvider,
  useIsAuthConfigured
} from '@/stores/useCurrentUser'
import { UserPreferencesProvider } from '@/stores/useUserPreferences'

import { CommandLayout } from './menus/CommandLayout'
import { IssueMenu } from './menus/IssueMenu'
import { MainMenu } from './menus/MainMenu'
import { CommandRoutes } from './routes'

function App() {
  return (
    <div className="linear w-xl">
      <Routes>
        <Route element={<CommandLayout />}>
          <Route index element={<MainMenu />} />

          <Route path={CommandRoutes.IssueDef} element={<IssueMenu />} />
        </Route>
      </Routes>
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <UserPreferencesProvider>
      <App />
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
