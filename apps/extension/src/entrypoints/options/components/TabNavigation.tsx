import { ComponentType } from 'react'
import { GitBranch, Info, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export interface Tab {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
  { id: 'about', label: 'About', icon: Info }
]

export function TabNavigation() {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.id}
              to={`/${tab.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 border-b-2 px-2 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }>
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
