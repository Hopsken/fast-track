import { useStorage, StorageKey } from '~/storage'

import { FormField, type FormFieldProps } from './FormField'

export type ToggleFormFieldProps = Omit<FormFieldProps, 'children'> & {
  storageKey: StorageKey.ColorCard | StorageKey.AutoFullScreen
}

export function ToggleFormField(props: ToggleFormFieldProps) {
  const { storageKey, ...formFieldProps } = props
  const [checked, setChecked] = useStorage(storageKey, false)

  return (
    <FormField {...formFieldProps}>
      <input
        type="checkbox"
        className="toggle toggle-lg"
        checked={Boolean(checked)}
        onChange={(e) => {
          setChecked(e.target.checked)
        }}
        aria-label={`Toggle ${formFieldProps.title}`}
      />
    </FormField>
  )
}
