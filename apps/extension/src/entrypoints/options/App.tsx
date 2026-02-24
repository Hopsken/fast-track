import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { browser } from 'wxt/browser'

import { QueryClientProvider } from '@/components/QueryClientProvider'
import { UserPreferencesProvider } from '~/stores/useUserPreferences'

import { OptionsHeader, TabNavigation, AboutTab } from './components'
import { GeneralTab } from './components/tabs/GeneralTab'
import { WorkflowTab } from './components/tabs/WorkflowTab'
import { TemplateDetailPage } from './routes/templates/TemplateDetailPage'
import { TemplateWizardPage } from './routes/templates/TemplateWizardPage'

import '~/assets/styles/main.css'

function OptionsPageLayout() {
  const version = browser.runtime.getManifest().version

  return (
    <UserPreferencesProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <OptionsHeader version={version} />

          <div className="rounded-lg border bg-white shadow-sm">
            <TabNavigation />

            <div className="p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/general" replace />} />
                <Route path="/general" element={<GeneralTab />} />

                <Route path="/workflow" element={<WorkflowTab />} />

                <Route path="/workflow/templates" element={<WorkflowTab />} />
                <Route
                  path="/workflow/templates/new"
                  element={<TemplateWizardPage />}
                />
                <Route
                  path="/workflow/templates/:id"
                  element={<TemplateDetailPage />}
                />

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
      <QueryClientProvider>
        <OptionsPageLayout />
      </QueryClientProvider>
    </HashRouter>
  )
}

export default OptionsPage
