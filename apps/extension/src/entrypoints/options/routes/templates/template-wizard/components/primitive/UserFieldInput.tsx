import { useMemo, useState } from 'react'
import { useDebounce } from 'ahooks'

import { InputSearch } from '@/components/ui/forms/InputSearch'
import { useAutoCompleteUsers } from '~/hooks/useAutoComplete'
import type { FieldMetadata } from '~/types/template'

interface UserFieldInputProps {
  field: FieldMetadata
  value: unknown
  onChange: (v: unknown) => void
}

export function UserFieldInput({
  field,
  value,
  onChange
}: UserFieldInputProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, { wait: 300 })

  const { data: users, isLoading } = useAutoCompleteUsers(
    field.autoCompleteUrl!,
    debouncedQuery
  )

  const selectedValue = value as
    | { accountId: string; displayName?: string; avatarUrl?: string }
    | undefined

  const options = useMemo(() => {
    const list = (users ?? [])
      .filter((u): u is typeof u & { accountId: string } =>
        Boolean(u.accountId)
      )
      .map((u) => ({
        value: u.accountId,
        label: u.displayName ?? u.name ?? 'Unknown',
        description: u.emailAddress,
        data: u.accountId
      }))

    if (
      selectedValue?.accountId &&
      !list.some((o) => o.value === selectedValue.accountId)
    ) {
      list.unshift({
        value: selectedValue.accountId,
        label: selectedValue.displayName ?? selectedValue.accountId,
        description: 'Currently selected',
        data: selectedValue.accountId
      })
    }

    return list
  }, [users, selectedValue])

  return (
    <InputSearch
      placeholder={`Search ${field.name}…`}
      query={query}
      onQueryChange={setQuery}
      options={options}
      value={selectedValue?.accountId ?? null}
      onSelect={(accountId) => {
        if (!accountId) {
          onChange(undefined)
          return
        }
        const user = users?.find((u) => u.accountId === accountId)
        if (user) {
          onChange({
            accountId: user.accountId,
            displayName: user.displayName,
            avatarUrl: user.avatarUrls?.['24x24']
          })
        } else if (selectedValue && selectedValue.accountId === accountId) {
          onChange(selectedValue)
        }
      }}
      isLoading={isLoading}
      filter={false}
      renderOptionIcon={(opt) => {
        const user = users?.find((u) => u.accountId === opt.data)
        const avatarUrl =
          user?.avatarUrls?.['24x24'] ??
          (selectedValue?.accountId === opt.data
            ? selectedValue.avatarUrl
            : undefined)
        if (!avatarUrl) return null
        return <img src={avatarUrl} className="size-5 rounded-full" alt="" />
      }}
    />
  )
}
