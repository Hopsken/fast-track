import { useStorage } from '@/hooks'
import { StorageKey, StorageValue } from '@/lib/storage'

import { FormField, type FormFieldProps } from './FormField'

export type ToggleFieldProps<T extends StorageKey> = Omit<
  FormFieldProps,
  'children'
> & {
  storageKey: StorageValue<T> extends boolean ? StorageKey : never
}

export function ToggleField<T extends StorageKey>(props: ToggleFieldProps<T>) {
  const { storageKey, ...formFieldProps } = props
  const [checked, setChecked] = useStorage(storageKey)

  return (
    <FormField {...formFieldProps}>
      <input
        type="checkbox"
        className="toggle toggle-lg"
        checked={Boolean(checked)}
        onChange={(e) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setChecked(e.target.checked)
        }}
        aria-label={`Toggle ${formFieldProps.title}`}
      />
    </FormField>
  )
}
