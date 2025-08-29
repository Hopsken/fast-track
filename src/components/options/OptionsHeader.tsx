import logoUrl from "~/assets/logo.png"
import { ProBadge } from "~/components/ProBadge"
import { useStorage, StorageKey } from "~/storage"

interface OptionsHeaderProps {
  version: string
  onTabChange?: (tabId: string) => void
}

export function OptionsHeader({ version, onTabChange }: OptionsHeaderProps) {
  const [license] = useStorage(StorageKey.License)

  const handleProBadgeClick = () => {
    if (onTabChange) {
      onTabChange('license')
    }
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} className="w-12 h-12" alt="Jira Boost" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Jira Boost</h1>
            <ProBadge 
              isPro={license?.valid || false} 
              onClick={handleProBadgeClick}
              interactive={!!onTabChange}
            />
          </div>
          <p className="text-gray-600">v{version} Settings</p>
        </div>
      </div>
    </header>
  )
}