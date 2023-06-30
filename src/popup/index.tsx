import { DarkModeControl } from "~components/DarkModeControl"
import { ToggleField } from "~components/ToggleField"
import { StorageKey } from "~storage"

import "~styles/style.css"

function Popup() {
  return (
    <div className="container mx-auto w-96 px-4 py-4 font-sans">
      <h1 className="text-lg font-medium text-slate-900">Jira Boost</h1>

      <div className="divider my-2" />

      <div className="flex flex-col space-y-4">
        <DarkModeControl />
        <ToggleField
          title="Highlight issue color"
          description="Highlight background color of issues"
          storageKey={StorageKey.ColorCard}
        />
        <ToggleField
          title="Enable browser fullscreen"
          description="Enter browser-level fullscreen when click on fullscreen button"
          storageKey={StorageKey.AutoFullScreen}
        />
      </div>
    </div>
  )
}

export default Popup
