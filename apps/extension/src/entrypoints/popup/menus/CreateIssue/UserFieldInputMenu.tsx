import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading,
  useCommandState,
  CommandItem
} from '@internal/ui/components/command'

import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'

type Props = {
  fieldId: string
  title: string
  autoCompleteUrl: string
  onDone: () => void
}

export function UserFieldInputMenu({
  fieldId,
  title,
  autoCompleteUrl,
  onDone
}: Props) {
  const query = useCommandState((s) => s.search)
  const { data: users, isLoading } = useAutoCompleteUsers(
    autoCompleteUrl,
    query
  )
  const { setValue } = useCreateIssueDraftStore()

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {(users ?? []).map((user) => {
          const displayName =
            user.displayName || user.name || user.emailAddress || 'Anonymous'

          return (
            <CommandItem
              key={user.accountId ?? displayName}
              value={displayName}
              onSelect={() => {
                setValue(fieldId, {
                  accountId: user.accountId,
                  displayName: user.displayName,
                  emailAddress: user.emailAddress
                })
                onDone()
              }}>
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
