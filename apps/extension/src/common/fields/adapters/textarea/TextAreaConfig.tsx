import { useCallback, useState } from 'react'
import { Textarea } from '@internal/ui/components/textarea'
import { z, ZodString } from 'zod'

import type {
  FieldConfigComponentProps,
  SelectComponentProps
} from '../../types'
import { GenericFieldConfig } from '../shared/GenericFieldConfig'

const TextAreaSelect = ({ value, onChange }: SelectComponentProps<string>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join('\n')
    return value
  })

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value
      setInputValue(next)

      // For textarea we treat the whole content as one string.
      const parsed = z.string().safeParse(next).data
      onChange(parsed ?? null)
    },
    [onChange]
  )

  return (
    <Textarea
      className="min-h-36"
      placeholder="Enter text…"
      value={inputValue}
      onChange={handleInput}
    />
  )
}

export const TextAreaConfig = (props: FieldConfigComponentProps<ZodString>) => {
  const { config, onChangeConfig } = props

  if (config.behavior === 'restricted') {
    const value = (config.allowedOptions ?? []).join('\n')

    return (
      <div className="space-y-1.5">
        <Textarea
          className="min-h-36"
          placeholder="One allowed value per line…"
          value={value}
          onChange={(e) => {
            const lines = e.target.value
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean)

            onChangeConfig({
              ...config,
              allowedOptions: lines
            })
          }}
        />
        <div className="text-muted-foreground text-xs">
          Each line becomes an allowed option.
        </div>
      </div>
    )
  }

  // preset
  return <GenericFieldConfig {...props} SelectorComponent={TextAreaSelect} />
}
