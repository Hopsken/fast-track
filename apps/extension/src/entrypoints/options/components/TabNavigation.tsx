import { ComponentType } from 'react'
import { FileText, Info, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export interface Tab {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'about', label: 'About', icon: Info }
]

export function TabNavigation() {
  return (
    <div className="border-border border-b">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.id}
              to={`/${tab.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 border-b-2 px-2 py-4 text-sm transition-colors ${
                  isActive
                    ? 'border-foreground text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground border-transparent font-medium'
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
