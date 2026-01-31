import { ComponentProps } from 'react'
import { CommandList } from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandControllerStore } from '@/stores/useCommandController'

export type CommandMenuProps = ComponentProps<typeof CommandList> & {
  shouldFilter?: boolean
  searchPlaceholder?: string
  searchReadonly?: boolean
}

export const CommandMenu = (props: CommandMenuProps) => {
  const { shouldFilter, searchPlaceholder, searchReadonly, ...restProps } =
    props

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

  return <CommandList {...restProps}>{props.children}</CommandList>
}
