import { useState } from 'react'
import { useDebounce } from 'ahooks'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { AutoComplete } from '@/components/ui/AutoComplete'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useAutoCompleteUsers } from '~/hooks/useAutoComplete'

import { FieldInputBaseProps } from '../../types'

export function UserFieldInput({
  field,
  value,
  onChange
}: FieldInputBaseProps<UserDetails>) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, { wait: 300 })

  const { data: users, isLoading } = useAutoCompleteUsers(
    field.autoCompleteUrl!,
    debouncedQuery
  )

  return (
    <AutoComplete
      isLoading={isLoading}
      options={users ?? []}
      value={value}
      onValueChange={(v) => onChange(v ?? undefined)}
      query={query}
      onQueryChange={setQuery}
      getOptionValue={(opt) => opt.accountId ?? ''}
      getOptionLabel={(opt) => opt.displayName ?? opt.name ?? 'Unknown'}
      getOptionDescription={(opt) => opt.emailAddress ?? ''}
      renderOptionIcon={(opt) => <UserAvatar user={opt} />}
    />
  )
}
