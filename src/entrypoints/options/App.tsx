import { useState } from "react"
import { useStorage, StorageKey } from "~/storage"
import { useVersion } from "~/hooks/useVersion"
import { 
  OptionsHeader, 
  TabNavigation, 
  GeneralTab, 
  DisplayTab, 
  SearchTab, 
  AboutTab 
} from "~/components/options"

import "~/assets/styles/main.css"

function OptionsPage() {
  const version = useVersion()
  const [activeTab, setActiveTab] = useState('general')
  const [ticketsData] = useStorage(StorageKey.TicketsData, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <OptionsHeader version={version} />

        <div className="bg-white rounded-lg shadow-sm border">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'display' && <DisplayTab />}
            {activeTab === 'search' && <SearchTab ticketCount={ticketsData.length} />}
            {activeTab === 'about' && <AboutTab version={version} />}
          </div>
        </div>
      </div>
    </div>
  )
}


export default OptionsPage
