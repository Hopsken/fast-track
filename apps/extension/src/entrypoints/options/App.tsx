import { browser } from '#imports'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom'

import { UserPreferencesProvider } from '~/stores/useUserPreferences'

import { OptionsHeader, TabNavigation, AboutTab } from './components'
import { GeneralTab } from './components/tabs/GeneralTab'
import { LicenseTab } from './components/tabs/LicenseTab'

import '~/assets/styles/main.css'

function OptionsPageLayout() {
  const version = browser.runtime.getManifest().version
  const navigate = useNavigate()

  return (
    <UserPreferencesProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <OptionsHeader
            version={version}
            onTabChange={(tabId) => navigate(`/${tabId}`)}
          />

          <div className="rounded-lg border bg-white shadow-sm">
            <TabNavigation />

            <div className="p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/general" replace />} />
                <Route path="/general" element={<GeneralTab />} />
                <Route path="/license" element={<LicenseTab />} />
                <Route path="/about" element={<AboutTab version={version} />} />
                <Route path="*" element={<Navigate to="/general" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </UserPreferencesProvider>
  )
}

function OptionsPage() {
  return (
    <HashRouter>
      <OptionsPageLayout />
    </HashRouter>
  )
}

export default OptionsPage
