import { ToggleField } from "~components/ToggleField"
import { StorageKey } from "~storage"
import "~styles/style.css"

function Popup() {
  return (
    <div className="container mx-auto w-96 px-4 py-6 font-sans">
      <h1 className="text-lg font-medium text-slate-900">Jira Boost</h1>

      <div className="divider" />

      <div className="flex flex-col space-y-4">
        <ToggleField
          title="Dark Mode"
          description="Enable dark mode on Jira pages"
          storageKey={StorageKey.DarkMode}
        />
        <ToggleField
          title="Highlight issue color"
          description="Highlight background color of issues"
          storageKey={StorageKey.ColorCard}
        />
      </div>
    </div>
  )
}

export default Popup
