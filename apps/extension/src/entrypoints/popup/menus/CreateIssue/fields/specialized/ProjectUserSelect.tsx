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
import { useFieldConfirm } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { UserDetails } from '@/types'

import { FieldInputProps } from '../primitive'
import { asRecord, getFieldTitle } from '../utils'

const toUserId = (user: UserDetails) =>
  user.accountId ?? user.emailAddress ?? ''

export function ProjectUserSelect({
  project,
  field,
  currentValue,
  onConfirm
}: FieldInputProps) {
  const { value, setValue, search, setSearch } = useCommandInput()
  const title = getFieldTitle(field)

  const { data: users, isLoading } = useProjectUsers(project.key, search)

  // Extract selected user from currentValue
  const selected = useMemo((): UserDetails | undefined => {
    const rec = asRecord(currentValue)
    if (!rec) return undefined
    return {
      accountId: typeof rec.accountId === 'string' ? rec.accountId : undefined,
      displayName:
        typeof rec.displayName === 'string' ? rec.displayName : undefined,
      emailAddress:
        typeof rec.emailAddress === 'string' ? rec.emailAddress : undefined
    }
  }, [currentValue])

  useMount(() => {
    if (selected) {
      setSearch('')
      setValue(toUserId(selected))
    }
  })

  const handleSelectUser = (user: UserDetails) => {
    onConfirm(user)
  }

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {(users ?? []).map((user) => {
          const userId = toUserId(user)
          const displayName =
            user.displayName || user.name || user.emailAddress || 'Anonymous'

          const userValue: UserDetails = {
            accountId: user.accountId,
            displayName: user.displayName,
            emailAddress: user.emailAddress
          }

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

      {useFieldConfirm({
        onConfirm: () => {
          if (value) {
            const user = users?.find((u) => toUserId(u) === value)
            if (user) {
              onConfirm(user)
            }
          }
        },
        keys: 'meta+enter'
      })}
    </CommandList>
  )
}
