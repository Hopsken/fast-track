import { useState } from 'react'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { AutoComplete } from '@/components/ui/AutoComplete'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useProjectUsers } from '@/hooks/useProjectUsers'

import { FieldInputBaseProps } from '../../types'

export function ProjectUserInput({
  project,
  value,
  onChange
}: FieldInputBaseProps<UserDetails>) {
  const [query, setQuery] = useState('')

  const { data: users, isLoading } = useProjectUsers(project.key, query)

  return (
    <AutoComplete<UserDetails>
      multiple={false}
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
