import { useMemoizedFn } from 'ahooks'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'

interface CommandInputEntry {
  search: string
  value: string
}

interface CommandInputStore {
  entries: Record<string, CommandInputEntry>
  setSearch: (key: string, search: string) => void
  setValue: (key: string, value: string) => void
}

const useCommandInputStore = create<CommandInputStore>((set) => ({
  entries: {},
  setSearch: (key, search) =>
    set((s) => ({
      entries: {
        ...s.entries,
        [key]: { search, value: s.entries[key]?.value ?? '' }
      }
    })),
  setValue: (key, value) =>
    set((s) => ({
      entries: {
        ...s.entries,
        [key]: { value, search: s.entries[key]?.search ?? '' }
      }
    }))
}))

export const useCommandInput = () => {
  const { key } = useLocation()
  const { entries, setValue, setSearch } = useCommandInputStore()

  const value = entries[key]?.value ?? ''
  const search = entries[key]?.search ?? ''

  const setValueCb = useMemoizedFn((v: string) => setValue(key, v))
  const setSearchCb = useMemoizedFn((s: string) => setSearch(key, s))

  return { value, setValue: setValueCb, search, setSearch: setSearchCb }
}

export const useCommandSearch = () => {
  const { key } = useLocation()
  return useCommandInputStore((s) => s.entries[key]?.search ?? '')
}
