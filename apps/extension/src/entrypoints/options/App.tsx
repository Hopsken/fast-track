import { browser } from '#imports'
import { useState } from 'react'

import {
  OptionsHeader,
  TabNavigation,
  GeneralTab,
  AboutTab
} from './components'

import '~/assets/styles/main.css'

function OptionsPage() {
  const version = browser.runtime.getManifest().version
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <OptionsHeader version={version} onTabChange={setActiveTab} />

        <div className="rounded-lg border bg-white shadow-sm">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'about' && <AboutTab version={version} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
