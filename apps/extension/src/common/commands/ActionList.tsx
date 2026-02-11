import { ComponentProps, ReactNode } from 'react'
import {
  CommandEmpty,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

export type ActionListProps = {
  isLoading?: boolean
  emptyPlaceholder?: ReactNode
  children?: ReactNode
} & ComponentProps<typeof CommandList>

export function ActionList(props: ActionListProps) {
  const {
    isLoading,
    children,
    emptyPlaceholder = 'No results',
    ...restProps
  } = props
  return (
    <CommandList {...restProps}>
      {children}
      {isLoading && <CommandLoading>Loading...</CommandLoading>}
      {!isLoading && emptyPlaceholder && (
        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
      )}
    </CommandList>
  )
}
