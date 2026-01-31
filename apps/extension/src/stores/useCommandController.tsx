import { pick } from 'lodash-es'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

type Callback = () => void

interface ControlState {
  shouldFilter: boolean
  searchPlaceholder: string
  searchReadonly: boolean

  setShouldFilter: (shouldFilter: boolean) => Callback
  setSearchPlaceholder: (placeholder: string) => Callback
  setSearchReadonly: (readonly: boolean) => Callback
}

export const useCommandControllerStore = create<ControlState>((set, get) => ({
  shouldFilter: true,
  searchPlaceholder: 'Search issues...',
  searchReadonly: false,
  setShouldFilter: (shouldFilter: boolean) => {
    const prev = get().shouldFilter
    set({ shouldFilter })
    return () => {
      set({ shouldFilter: prev })
    }
  },
  setSearchPlaceholder: (placeholder: string) => {
    const prev = get().searchPlaceholder
    set({ searchPlaceholder: placeholder })
    return () => {
      set({ searchPlaceholder: prev })
    }
  },
  setSearchReadonly: (readonly: boolean) => {
    const prev = get().searchReadonly
    set({ searchReadonly: readonly })
    return () => {
      set({ searchReadonly: prev })
    }
  }
}))

export const useCommandSearchState = () => {
  return useCommandControllerStore(
    useShallow((store) =>
      pick(store, ['shouldFilter', 'searchPlaceholder', 'searchReadonly'])
    )
  )
}
