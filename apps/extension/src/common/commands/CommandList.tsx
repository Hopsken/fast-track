import { ComponentProps, ReactNode } from 'react'
import {
  CommandEmpty,
  CommandList as CommandListComponent,
  CommandLoading
} from '@internal/ui/components/command'

export type CommandListProps = {
  isLoading?: boolean
  showPlaceholder?: boolean
  emptyPlaceholder?: ReactNode
  children?: ReactNode
} & ComponentProps<typeof CommandListComponent>

export function CommandList(props: CommandListProps) {
  const {
    isLoading,
    children,
    showPlaceholder = true,
    emptyPlaceholder = 'No results',
    ...restProps
  } = props
  return (
    <CommandListComponent {...restProps}>
      {isLoading && <CommandLoading>Loading...</CommandLoading>}
      {!isLoading && showPlaceholder && (
        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
      )}
      {children}
    </CommandListComponent>
  )
}
