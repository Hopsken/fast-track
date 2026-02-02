import { ComponentProps, PropsWithChildren } from 'react'
import { CommandList } from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandControllerStore } from '@/stores/command/useCommandController'

export type CommandControllerProps = PropsWithChildren<{
  shouldFilter?: boolean
  searchPlaceholder?: string
  searchReadonly?: boolean
}>

export type CommandMenuProps = ComponentProps<typeof CommandList> &
  CommandControllerProps

export const CommandControl = (props: CommandControllerProps) => {
  const { shouldFilter, searchPlaceholder, searchReadonly } = props

  useMount(() => {
    const restoreShouldFilter =
      shouldFilter != null
        ? useCommandControllerStore.getState().setShouldFilter(shouldFilter)
        : undefined
    const restoreSearchPlaceholder =
      searchPlaceholder != null
        ? useCommandControllerStore
            .getState()
            .setSearchPlaceholder(searchPlaceholder)
        : undefined
    const restoreSearchReadonly =
      searchReadonly != null
        ? useCommandControllerStore.getState().setSearchReadonly(searchReadonly)
        : undefined

    return () => {
      restoreShouldFilter?.()
      restoreSearchPlaceholder?.()
      restoreSearchReadonly?.()
    }
  })

  return props.children
}

export const CommandMenu = (props: CommandMenuProps) => {
  const {
    shouldFilter,
    searchPlaceholder,
    searchReadonly,
    children,
    ...restProps
  } = props
  return (
    <CommandList {...restProps}>
      <CommandControl
        shouldFilter={shouldFilter}
        searchPlaceholder={searchPlaceholder}
        searchReadonly={searchReadonly}>
        {children}
      </CommandControl>
    </CommandList>
  )
}
