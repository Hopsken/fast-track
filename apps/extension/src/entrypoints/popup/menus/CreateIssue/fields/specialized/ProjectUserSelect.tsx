import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useProjectUsers } from '@/hooks/useProjectUsers'
import { JiraUserSchema, type JiraUser } from '@/repository/schema'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { FieldInputProps } from '../primitive'
import { getFieldTitle } from '../utils'

const toUserId = (user: JiraUser) => user.accountId || user.emailAddress || ''

export function ProjectUserSelect({
  project,
  field,
  currentValue,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { setValue, search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  const { data: users, isLoading } = useProjectUsers(project.key, search)

  // Extract selected user from currentValue
  const selected = useMemo((): JiraUser | undefined => {
    const parsed = JiraUserSchema.safeParse(currentValue)
    return parsed.success ? parsed.data : undefined
  }, [currentValue])

  useMount(() => {
    if (selected) {
      setValue(toUserId(selected))
    }
  })

  const handleSelectUser = (user: JiraUser) => {
    onChange(user)
    onConfirm()
  }

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {(users ?? []).map((user) => {
          const parsedUser = JiraUserSchema.safeParse(user)
          if (!parsedUser.success) return null

          const userValue = parsedUser.data
          const userId = toUserId(userValue)
          const displayName = userValue.displayName

          return (
            <CommandItem
              key={userId}
              value={userId}
              keywords={[
                user.displayName ?? '',
                user.emailAddress ?? '',
                user.name ?? ''
              ]}
              onSelect={() => handleSelectUser(userValue)}>
              <span className="truncate">{displayName}</span>
            </CommandItem>
          )
        })}

        {!isLoading && (users ?? []).length === 0 ? (
          <CommandEmpty>Type to search users...</CommandEmpty>
        ) : null}
      </CommandGroup>
    </CommandList>
  )
}
