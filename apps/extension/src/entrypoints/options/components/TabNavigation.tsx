import { ComponentType } from 'react'
import { HiCog, HiInformationCircle, HiKey } from 'react-icons/hi'

export interface Tab {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: HiCog },
  // { id: 'license', label: 'License', icon: HiKey },
  { id: 'about', label: 'About', icon: HiInformationCircle }
]

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
