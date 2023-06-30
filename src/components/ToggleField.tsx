import { useStorage } from "@plasmohq/storage/hook"

import type { StorageKey } from "~storage"

import { FieldControl, type FieldControlProps } from "./FieldControl"

export type ToggleFieldProps<T extends StorageKey> = FieldControlProps & {
  storageKey: T
}

export function ToggleField<T extends StorageKey>(props: ToggleFieldProps<T>) {
  const [checked, setChecked] = useStorage(props.storageKey, false)
  return (
    <FieldControl title={props.title} description={props.description}>
      <input
        type="checkbox"
        className="toggle toggle-sm"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked)
        }}
      />
    </FieldControl>
  )
}
