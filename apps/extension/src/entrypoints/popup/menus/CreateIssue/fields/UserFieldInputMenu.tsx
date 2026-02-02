import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { useFieldConfirm } from '../useFieldConfirm'

export type UserValue = {
  accountId?: string
  displayName?: string
  emailAddress?: string
}

type Props = {
  title: string
  selected?: UserValue
  autoCompleteUrl: string
  onConfirm: (value: UserValue) => void
}

const toUserId = (user: UserValue) => user.accountId ?? user.emailAddress ?? ''

export function UserFieldInputMenu({
  title,
  selected,
  autoCompleteUrl,
  onConfirm
}: Props) {
  const { value, setValue, search, setSearch } = useCommandInput()
  const { data: users, isLoading } = useAutoCompleteUsers(
    autoCompleteUrl,
    search
  )

  useMount(() => {
    if (selected) {
      setSearch('')
      setValue(toUserId(selected))
    }
  })

  const handleSelectUser = (user: UserValue) => {
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

          const userValue: UserValue = {
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
