import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface CommandStoreState {
  value: string
  setValue: (value: string) => void

  isLoading?: boolean
  searchPlaceholder?: string
  searchReadonly?: boolean

  search: string
  setSearch: (search: string) => void

  shouldFilter:
    | boolean
    | ((state: { search: string; value: string }) => boolean)
}

type CommandStore = StoreApi<CommandStoreState>

export type CommandProviderProps = Partial<
  Pick<
    CommandStoreState,
    | 'value'
    | 'search'
    | 'isLoading'
    | 'searchPlaceholder'
    | 'searchReadonly'
    | 'shouldFilter'
  >
>

const createCommandStore = (props: CommandProviderProps) =>
  createStore<CommandStoreState>()(
    devtools((set) => ({
      value: props.value ?? '',
      setValue: (value) => set({ value }),

      isLoading: props.isLoading ?? false,
      searchPlaceholder: props.searchPlaceholder ?? 'Filter by title...',
      searchReadonly: props.searchReadonly ?? false,

      search: props.search ?? '',
      setSearch: (search) => set({ search }),

      shouldFilter: props.shouldFilter ?? true
    }))
  )

const CommandStoreContext = createContext<CommandStore | null>(null)

export const CommandStoreProvider = ({
  children,
  ...props
}: PropsWithChildren<CommandProviderProps>) => {
  const [store] = useState(() => createCommandStore(props))
  return (
    <CommandStoreContext.Provider value={store}>
      {children}
    </CommandStoreContext.Provider>
  )
}

export const useCommandStore = <R,>(
  selector: (state: CommandStoreState) => R
) => {
  const store = useContext(CommandStoreContext)
  if (!store) throw new Error('Missing CommandStoreProvider')
  return useStore(store, selector)
}

export const useSetCommandSearch = () => {
  return useCommandStore((state) => state.setSearch)
}

export const useCommandSearch = () => {
  return useCommandStore((state) => state.search)
}
