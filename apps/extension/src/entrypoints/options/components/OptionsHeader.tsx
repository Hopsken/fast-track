import { useStorage } from '@/hooks/useStorage'
import logoUrl from '~/assets/logo.png'
import { ProBadge } from '~/components/ProBadge'

interface OptionsHeaderProps {
  version: string
  onTabChange?: (tabId: string) => void
}

export function OptionsHeader({ version, onTabChange }: OptionsHeaderProps) {
  const [license] = useStorage('License')

  const handleProBadgeClick = () => {
    if (onTabChange) {
      onTabChange('license')
    }
  }

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} className="h-12 w-12" alt="Fast Track" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Fast Track</h1>
            <ProBadge
              isPro={!!license?.instance || false}
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
