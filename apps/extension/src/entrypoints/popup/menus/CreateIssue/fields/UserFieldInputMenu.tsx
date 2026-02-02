import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading,
  useCommandState
} from '@internal/ui/components/command'

import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'

export type UserValue = {
  accountId?: string
  displayName?: string
  emailAddress?: string
}

type Props = {
  title: string
  autoCompleteUrl: string
  onConfirm: (value: UserValue) => void
}

export function UserFieldInputMenu({
  title,
  autoCompleteUrl,
  onConfirm
}: Props) {
  const query = useCommandState((s) => s.search)
  const { data: users, isLoading } = useAutoCompleteUsers(
    autoCompleteUrl,
    query
  )

  const handleSelectUser = (user: UserValue) => {
    onConfirm(user)
  }

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {(users ?? []).map((user) => {
          const displayName =
            user.displayName || user.name || user.emailAddress || 'Anonymous'

          const userValue: UserValue = {
            accountId: user.accountId,
            displayName: user.displayName,
            emailAddress: user.emailAddress
          }

          return (
            <CommandItem
              key={user.accountId ?? displayName}
              value={displayName}
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
