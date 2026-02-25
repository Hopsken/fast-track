import { KeyboardEvent, useCallback, useState } from 'react'
import { Textarea } from '@internal/ui/components/textarea'
import { z, ZodString } from 'zod'

import type {
  FieldConfigComponentProps,
  SelectComponentProps
} from '../../types'
import { GenericFieldConfig } from '../shared/GenericFieldConfig'

const TextAreaPresetSelect = ({
  value,
  onChange
}: SelectComponentProps<string>) => {
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

const TextAreaRestrictedSelect = ({
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join('\n')
    return value
  })

  const parse = useCallback((raw: string) => {
    // preserve user formatting; only reject all-whitespace
    if (!raw.trim()) return null
    return raw
  }, [])

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value
      setInputValue(next)
      onChange(parse(next))
    },
    [onChange, parse]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // In textarea, Enter should insert a newline.
      // Use Ctrl/Cmd+Enter as the keyboard "confirm" shortcut.
      if (e.key !== 'Enter') return
      if (!e.metaKey && !e.ctrlKey) return
      if (e.shiftKey || e.altKey) return

      e.preventDefault()
      const next = parse(e.currentTarget.value)
      if (!next) return
      onConfirm?.(next)
    },
    [onConfirm, parse]
  )

  return (
    <Textarea
      className="min-h-24"
      placeholder="Enter snippet…"
      value={inputValue}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
    />
  )
}

export const TextAreaConfig = (props: FieldConfigComponentProps<ZodString>) => {
  const selector =
    props.config.behavior === 'restricted'
      ? TextAreaRestrictedSelect
      : TextAreaPresetSelect

  return <GenericFieldConfig {...props} SelectorComponent={selector} />
}
