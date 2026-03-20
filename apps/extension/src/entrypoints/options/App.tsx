import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'
import { browser } from 'wxt/browser'

import { QueryClientProvider } from '@/components/QueryClientProvider'
import { UserPreferencesProvider } from '~/stores/useUserPreferences'

import { OptionsHeader, TabNavigation, AboutTab } from './components'
import { GeneralTab } from './components/tabs/GeneralTab'
import { TemplateDetailPage } from './routes/templates/TemplateDetailPage'
import { TemplatesIndexPage } from './routes/templates/TemplatesIndexPage'
import { TemplateWizardPage } from './routes/templates/TemplateWizardPage'

import '~/assets/styles/main.css'

const SPRING = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 30,
  mass: 0.4
}

function AnimatedRoutes({ version }: { version: string }) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
        transition={SPRING}
        className="p-6">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/general" replace />} />
          <Route path="/general" element={<GeneralTab />} />

          <Route path="/templates" element={<TemplatesIndexPage />} />
          <Route path="/templates/new" element={<TemplateWizardPage />} />
          <Route path="/templates/:id" element={<TemplateDetailPage />} />

          <Route path="/about" element={<AboutTab version={version} />} />
          <Route path="*" element={<Navigate to="/general" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function OptionsPageLayout() {
  const version = browser.runtime.getManifest().version

  return (
    <UserPreferencesProvider>
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <OptionsHeader version={version} />

          <div className="bg-card rounded-lg border shadow-sm">
            <TabNavigation />
            <AnimatedRoutes version={version} />
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
