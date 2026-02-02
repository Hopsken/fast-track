import { useHotkeys } from 'react-hotkeys-hook'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

export function useScalarFieldEnter(params: {
  fieldId: string
  schemaType: string | undefined
  schemaItems: string | undefined
  hasAllowedOptions: boolean
  isCombinedField: boolean
  onSubmit: (value: unknown) => void
}): void {
  const {
    fieldId,
    schemaType,
    schemaItems,
    hasAllowedOptions,
    isCombinedField,
    onSubmit
  } = params

  const { search } = useCommandInput()

  const enableEnterSave =
    fieldId === 'summary' ||
    schemaType === 'string' ||
    schemaType === 'number' ||
    (schemaType === 'array' &&
      schemaItems === 'string' &&
      !hasAllowedOptions) ||
    !schemaType

  useHotkeys(
    'enter',
    () => {
      if (schemaType === 'number') {
        const trimmed = search.trim()
        if (!trimmed) {
          onSubmit(undefined)
          return
        }
        const num = Number(trimmed)
        if (!Number.isFinite(num)) return
        onSubmit(num)
        return
      }

      // labels-style fallback: array<string> (comma separated)
      if (
        schemaType === 'array' &&
        schemaItems === 'string' &&
        !hasAllowedOptions
      ) {
        const parts = search
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        onSubmit(parts)
        return
      }

      if (fieldId === 'summary' || schemaType === 'string' || !schemaType) {
        onSubmit(search)
      }
    },
    {
      enabled: enableEnterSave && !isCombinedField,
      preventDefault: true,
      enableOnFormTags: true
    },
    [
      search,
      enableEnterSave,
      hasAllowedOptions,
      fieldId,
      onSubmit,
      schemaItems,
      schemaType
    ]
  )
}
