import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey } from "~storage"

import { FieldControl } from "./FieldControl"

export function DarkModeControl() {
  const [mode, setMode] = useStorage(StorageKey.DarkMode, (v) =>
    v === undefined ? "auto" : v
  )
  return (
    <FieldControl
      size="sm"
      title={"Dark Mode"}
      description={"Enable dark mode on Jira pages"}>
      <select
        className="select select-bordered select-sm"
        value={mode}
        onChange={(e) => setMode(e.target.value)}>
        <option value="auto">Auto</option>
        <option value="always">Dark</option>
        <option value="disable">Light</option>
      </select>
    </FieldControl>
  )
}
