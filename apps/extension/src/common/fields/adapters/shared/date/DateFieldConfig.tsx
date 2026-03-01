import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@internal/ui/components/input-group'
import { useDebounce } from 'ahooks'
import { ZodString } from 'zod'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { isSchemaMulti } from '../../../utils'
import { GenericFieldConfig } from '../GenericFieldConfig'
import { Unsupported } from '../Unsupported'

import { parseSemanticDateValue } from './dateParsing'

const DateSelect = ({
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  const initialValue = Array.isArray(value) || value == null ? '' : value

  const [inputValue, setInputValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  // Keep local input in sync when external value changes (e.g. mode switches)
  useEffect(() => {
    if (isFocused) return
    setInputValue(initialValue)
  }, [initialValue, isFocused])

  const debouncedInput = useDebounce(inputValue, {
    wait: 400,
    leading: false,
    trailing: true
  })

  const parseResult = useMemo(() => {
    return parseSemanticDateValue(debouncedInput)
  }, [debouncedInput])
  const preview = useMemo(() => {
    if (parseResult.status !== 'valid') return null
    return { iso: parseResult.iso, kind: parseResult.kind }
  }, [parseResult])

  const isInvalid = useMemo(() => {
    const trimmed = debouncedInput.trim()
    if (!trimmed) return false
    return parseResult.status === 'invalid'
  }, [debouncedInput, parseResult])

  const commit = useCallback(
    (triggerConfirm: boolean) => {
      const trimmed = inputValue.trim()

      if (!trimmed) {
        setInputValue('')
        onChange(null)
        if (triggerConfirm) onConfirm?.(null)
        return
      }

      const parsed = parseSemanticDateValue(trimmed)

      if (parsed.status !== 'valid') {
        // Keep raw user input; validation happens on save.
        onChange(trimmed)
        return
      }

      if (parsed.kind === 'absolute') {
        setInputValue(parsed.iso)
        onChange(parsed.iso)
        if (triggerConfirm) onConfirm?.(parsed.iso)
        return
      }

      // relative
      setInputValue(trimmed)
      onChange(trimmed)
      if (triggerConfirm) onConfirm?.(trimmed)
    },
    [inputValue, onChange, onConfirm]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        commit(true)
        return
      }

      if (e.key === 'Tab') {
        commit(true)
      }
    },
    [commit]
  )

  return (
    <InputGroup>
      <InputGroupInput
        placeholder='YYYY-MM-DD or "tomorrow"'
        value={inputValue}
        aria-invalid={isInvalid}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          commit(false)
        }}
        onChange={(e) => {
          const next = e.target.value
          setInputValue(next)
          onChange(next)
        }}
        onKeyDown={onKeyDown}
      />

      {(preview || isInvalid) && (
        <InputGroupAddon align="block-end" className="text-xs">
          {isInvalid ? (
            <InputGroupText className="text-destructive">Couldn't parse</InputGroupText>
          ) : preview ? (
            <InputGroupText className="text-muted-foreground">
              Preview → <span className="font-mono tabular-nums">{preview.iso}</span>
            </InputGroupText>
          ) : null}
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export const DateFieldConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  if (isSchemaMulti(props.context.metadata)) {
    return <Unsupported context={props.context} />
  }

  return <GenericFieldConfig {...props} SelectorComponent={DateSelect} />
}
