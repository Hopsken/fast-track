import { ComponentProps, ReactNode } from 'react'
import {
  CommandEmpty,
  CommandList as CommandListComponent,
  CommandLoading
} from '@internal/ui/components/command'

export type CommandListProps = {
  isLoading?: boolean
  emptyPlaceholder?: ReactNode
} & ComponentProps<typeof CommandListComponent>

export function CommandList(props: CommandListProps) {
  const {
    isLoading,
    children,
    emptyPlaceholder = 'No results',
    ...restProps
  } = props
  return (
    <CommandListComponent {...restProps}>
      {isLoading && <CommandLoading>Loading...</CommandLoading>}
      {<CommandEmpty>{emptyPlaceholder}</CommandEmpty>}
      {children}
    </CommandListComponent>
  )
}
