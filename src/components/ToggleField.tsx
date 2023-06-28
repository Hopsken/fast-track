import { useStorage } from "@plasmohq/storage/hook"

import { FieldControl, type FieldControlProps } from "./FieldControl"

export type ToggleFieldProps = FieldControlProps & {
  storageKey: string
}

export function ToggleField(props: ToggleFieldProps) {
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
