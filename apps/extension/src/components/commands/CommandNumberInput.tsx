import { useCallback, useState } from 'react'
import { z } from 'zod'

import { ActionPanel } from '@/common/commands'

export type CommandNumberInputProps = {
  title?: string
  value?: number
  onChange: (value: number | null) => void

  onConfirm: () => void
}

export function CommandNumberInput({
  value,
  onChange,
  onConfirm
}: CommandNumberInputProps) {
  const [search, setSearch] = useState(value != null ? String(value) : '')

  const onSearchChange = useCallback(
    (newValue: string) => {
      setSearch(newValue)

      const num = z.number().safeParse(newValue).data
      onChange(num ?? null)
    },
    [onChange]
  )

  const onSearchConfirm = useCallback(() => {
    const num = z.number().safeParse(search).data
    onChange(num ?? null)
    onConfirm()
  }, [search, onChange, onConfirm])

  return (
    <ActionPanel
      search={search}
      onSearchChange={onSearchChange}
      onSearchConfirm={onSearchConfirm}
      searchPlaceholder="Type a number and press Enter"
    />
  )
}
