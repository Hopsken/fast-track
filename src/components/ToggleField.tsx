import { FieldControl, type FieldControlProps } from "./FieldControl"

export type ToggleFieldProps<T extends WxtStorageItem<boolean, any>> =
  FieldControlProps & {
    storageKey: T
  }

export function ToggleField<T extends WxtStorageItem<boolean, any>>(
  props: ToggleFieldProps<T>
) {
  const [checked, setChecked] = useStorage<WxtStorageItem<boolean, any>>(
    props.storageKey,
    false
  )
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
