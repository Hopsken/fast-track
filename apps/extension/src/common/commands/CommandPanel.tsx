import { PropsWithChildren, useMemo } from 'react'
import { Command as CommandComponent } from '@internal/ui/components/command'
import { pick } from 'lodash-es'
import { useShallow } from 'zustand/shallow'

import { CommandSearch } from './CommandSearch'
import {
  CommandProviderProps,
  CommandStoreProvider,
  useCommandStore
} from './context'

const CommandRoot = (props: PropsWithChildren) => {
  const {
    value,
    search,
    setValue,
    shouldFilter = true
  } = useCommandStore(
    useShallow((s) => pick(s, ['value', 'search', 'setValue', 'shouldFilter']))
  )

  const isFilterOn = useMemo(() => {
    if (typeof shouldFilter === 'boolean') return shouldFilter
    return shouldFilter({ search, value })
  }, [shouldFilter, search, value])

  return (
    <CommandComponent
      value={value}
      onValueChange={setValue}
      shouldFilter={isFilterOn}>
      <CommandSearch />
      {props.children}
    </CommandComponent>
  )
}

export const CommandPanel = ({
  children,
  ...props
}: PropsWithChildren<CommandProviderProps>) => {
  return (
    <CommandStoreProvider {...props}>
      <CommandRoot>{children}</CommandRoot>
    </CommandStoreProvider>
  )
}
