import { useStorage, StorageKey, StorageValueRecord } from '~/storage'

import { SelectFormField } from './SelectFormField'

const darkModeOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'always', label: 'Always Dark' },
  { value: 'disable', label: 'Always Light' }
]

export function DarkModeControl() {
  const [mode, setMode] = useStorage(StorageKey.DarkMode, 'auto')

  return (
    <SelectFormField
      size="lg"
      title="Dark Mode"
      description="Enable dark mode on Jira pages"
      value={mode}
      onChange={(value) =>
        setMode(value as StorageValueRecord[StorageKey.DarkMode])
      }
      options={darkModeOptions}
    />
  )
}
