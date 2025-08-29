import { useStorage, StorageKey, StorageValueRecord } from "~/storage"
import { FieldControl } from "./FieldControl"

export function DarkModeControl() {
  const [mode, setMode] = useStorage(StorageKey.DarkMode, "auto")
  
  return (
    <FieldControl
      size="lg"
      title="Dark Mode"
      description="Enable dark mode on Jira pages">
      <select
        className="select select-bordered select-lg"
        value={mode}
        onChange={(e) => setMode(e.target.value as StorageValueRecord[StorageKey.DarkMode])}>
        <option value="auto">Auto</option>
        <option value="always">Always Dark</option>
        <option value="disable">Always Light</option>
      </select>
    </FieldControl>
  )
}
