import { ComponentProps, ReactNode } from 'react'
import {
  CommandEmpty,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

export type ActionListProps = {
  isLoading?: boolean
  loadingPlaceholder?: ReactNode
  emptyPlaceholder?: ReactNode
  children?: ReactNode
} & ComponentProps<typeof CommandList>

export function ActionList(props: ActionListProps) {
  const {
    isLoading,
    loadingPlaceholder = 'Loading...',
    children,
    emptyPlaceholder = 'No results found',
    ...restProps
  } = props
  return (
    <CommandList {...restProps}>
      {children}
      {isLoading && <CommandLoading>{loadingPlaceholder}</CommandLoading>}
      {!isLoading && emptyPlaceholder && (
        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
      )}
    </CommandList>
  )
}
