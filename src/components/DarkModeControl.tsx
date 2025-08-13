import { DarkModeVariant } from "@/utils/storage"

import { FieldControl } from "./FieldControl"

export function DarkModeControl() {
  const [mode, setMode] = useStorage(persistLayer.darkMode, "auto")
  return (
    <FieldControl
      size="sm"
      title={"Dark Mode"}
      description={"Enable dark mode on Jira pages"}>
      <select
        className="select select-bordered select-sm"
        value={mode}
        onChange={(e) => setMode(e.target.value as DarkModeVariant)}>
        <option value="auto">Auto</option>
        <option value="always">Dark</option>
        <option value="disable">Light</option>
      </select>
    </FieldControl>
  )
}
