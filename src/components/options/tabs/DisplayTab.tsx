import { DarkModeControl, ToggleField } from '~/components/ui/forms'
import { StorageKey } from '~/storage'

export function DisplayTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Theme & Display
        </h2>
        <div className="space-y-6">
          <DarkModeControl />
          <ToggleField
            title="Highlight issue color"
            description="Highlight background color of issues in Jira boards"
            storageKey={StorageKey.ColorCard}
          />
          <ToggleField
            title="Enable browser fullscreen"
            description="Enter browser-level fullscreen when clicking the fullscreen button"
            storageKey={StorageKey.AutoFullScreen}
          />
        </div>
      </div>
    </div>
  )
}
