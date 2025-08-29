import { HiChevronRight } from "react-icons/hi2"

import { DarkModeControl, FieldControl, ToggleField } from "~/components/ui"
import { useStorage } from "~/hooks/useStorage"
import { StorageKey } from "~/storage/keys"
import { openOptionsPage } from "~/utils/extension/tabs"

function CustomBackgroundPreview() {
  const [custom] = useStorage(StorageKey.CustomBackground)

  if (!custom) return null
  return (
    <img
      className="w-12 aspect-4/3 rounded shadow-sm"
      src={custom.thumb_url}
      alt="custom"
    />
  )
}

export function PopupHomeMenu() {
  return (
    <div className="flex flex-col space-y-4">
      {/* <Link to={"/themes"}>
        <FieldControl
          size="sm"
          title="Background"
          description="Set the background image of Kanban board">
          <div className="flex space-x-2 items-center">
            <CustomBackgroundPreview />
            <HiChevronRight />
          </div>
        </FieldControl>
      </Link> */}

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

      <FieldControl
        title="More settings"
        description="See more settings, such as quick jump"
        onClick={() => openOptionsPage()}>
        <HiChevronRight />
      </FieldControl>
    </div>
  )
}
