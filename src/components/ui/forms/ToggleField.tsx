import { FieldControl, type FieldControlProps } from './FieldControl'

import { useStorage, StorageKey } from '~/storage'

export type ToggleFieldProps = FieldControlProps & {
  storageKey: StorageKey.ColorCard | StorageKey.AutoFullScreen
}

export function ToggleField(props: ToggleFieldProps) {
  const [checked, setChecked] = useStorage(props.storageKey, false)

  return (
    <FieldControl
      title={props.title}
      description={props.description}
      size={props.size || 'lg'}>
      <input
        type="checkbox"
        className="toggle toggle-lg"
        checked={Boolean(checked)}
        onChange={(e) => {
          setChecked(e.target.checked)
        }}
      />
    </FieldControl>
  )
}
