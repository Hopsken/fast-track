import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { z } from 'zod'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { prefillNumberValue } from './utils'

export type CommandNumberInputProps = {
  title?: string
  value?: number
  onChange: (value: number | null) => void
  onConfirm: () => void
}

export function CommandNumberInput({
  title,
  value,
  onChange,
  onConfirm
}: CommandNumberInputProps) {
  // TODO: fix deps
  const { search, setSearch } = useCommandInput()

  // Pre-fill the search box with current value
  useMount(() => {
    prefillNumberValue(value, setSearch)
  })

  useHotkey('field.confirm-simple', () => {
    const trimmed = search.trim()
    if (!trimmed) return onChange(null)

    const num = z.number().safeParse(trimmed).data
    if (num === undefined) {
      return
    }

    onChange(num)
    onConfirm()
  })

  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a number and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
