import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useStore, StoreApi } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createStore } from 'zustand/vanilla'

// --- Types ---

// User defines this map: { "root": void; "details": { id: string } }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteMap = Record<string, any>

interface PageSnapshot<T extends RouteMap> {
  path: keyof T
  state: T[keyof T]
  value: string
  search: string
}

interface CommandRouterState<T extends RouteMap> {
  history: PageSnapshot<T>[]
  setSearch: (search: string) => void
  setValue: (value: string) => void
  push: <K extends keyof T>(
    path: K,
    ...args: T[K] extends void | undefined ? [state?: never] : [state: T[K]]
  ) => void
  pop: () => void
}

type CommandRouterStore<T extends RouteMap> = StoreApi<CommandRouterState<T>>

// We use 'any' here to allow generic instantiation later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CommandRouterContext = createContext<CommandRouterStore<any> | null>(null)

function createCommandRouterStore<T extends RouteMap>(
  defaultPage: keyof T
): CommandRouterStore<T> {
  const defaultPageSnapshot: PageSnapshot<T> = {
    path: defaultPage,

    state: undefined as T[keyof T],
    search: '',
    value: ''
  }

  return createStore<CommandRouterState<T>>((set) => ({
    history: [defaultPageSnapshot],

    setSearch: (search) => {
      set((curr) => {
        if (curr.history.length === 0) return curr
        const nextPages = [...curr.history]
        const activePage = nextPages[nextPages.length - 1]!
        activePage.search = search
        return {
          history: nextPages
        }
      })
    },

    setValue: (value) => {
      set((curr) => {
        if (curr.history.length === 0) return curr
        const nextPages = [...curr.history]
        const activePage = nextPages[nextPages.length - 1]!
        activePage.value = value
        return {
          history: nextPages
        }
      })
    },

    push: (path, ...args) => {
      const state = args[0] as T[keyof T]
      set((curr) => {
        const nextPage: PageSnapshot<T> = { path, state, search: '', value: '' }
        return {
          ...curr,
          history: [...curr.history, nextPage]
        }
      })
    },

    pop: () => {
      set((curr) => {
        if (curr.history.length <= 1) return curr
        return {
          ...curr,
          history: curr.history.slice(0, -1)
        }
      })
    }
  }))
}

function useCommandRouterStore<T extends RouteMap>() {
  const store = useContext(CommandRouterContext) as CommandRouterStore<T> | null
  if (!store)
    throw new Error('useCommandRouter must be used within a <CommandRouter>')
  return store
}

export function useCommandRouter<T extends RouteMap>() {
  const store = useCommandRouterStore<T>()

  return useStore(
    store,
    useShallow((state) => {
      const activePage = state.history[state.history.length - 1]!
      return {
        activePage,
        activeSearch: activePage.search,
        activeValue: activePage.value,
        history: state.history,
        setSearch: state.setSearch,
        setValue: state.setValue,
        push: state.push,
        pop: state.pop
      }
    })
  )
}

export function useCommandRouterActivePage<T extends RouteMap>() {
  const store = useCommandRouterStore<T>()
  return useStore(store, (state) => state.history[state.history.length - 1]!)
}

export function useCommandNavigate<T extends RouteMap>() {
  const store = useCommandRouterStore<T>()
  return useStore(
    store,
    useShallow((state) => ({
      push: state.push,
      pop: state.pop
    }))
  )
}

interface CommandRouterProps<T extends RouteMap> {
  children: ReactNode
  defaultPage: keyof T
}

export function CommandRouter<T extends RouteMap>({
  children,
  defaultPage
}: CommandRouterProps<T>) {
  const store = useMemo(
    () => createCommandRouterStore<T>(defaultPage),
    [defaultPage]
  )

  return (
    <CommandRouterContext.Provider value={store}>
      {children}
    </CommandRouterContext.Provider>
  )
}

interface CommandRouteProps<T extends RouteMap, K extends keyof T> {
  path: K
  children: ReactNode | ((state: T[K]) => ReactNode)
}

export function CommandRoute<T extends RouteMap, K extends keyof T>({
  path,
  children
}: CommandRouteProps<T, K>) {
  const activePage = useCommandRouterActivePage<T>()

  if (activePage.path !== path) return null

  if (typeof children === 'function') {
    return <>{children(activePage.state as T[K])}</>
  }

  return <>{children}</>
}
