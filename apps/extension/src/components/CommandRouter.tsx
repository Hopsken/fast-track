import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

// --- Types ---

// User defines this map: { "root": void; "details": { id: string } }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteMap = Record<string, any>

interface PageSnapshot<T extends RouteMap> {
  path: keyof T
  state: T[keyof T]
}

interface CommandRouterContextType<T extends RouteMap> {
  activePage: PageSnapshot<T>
  pages: PageSnapshot<T>[]
  // Push is strictly typed based on the Generic T
  push: <K extends keyof T>(
    path: K,
    ...args: T[K] extends void | undefined ? [state?: never] : [state: T[K]]
  ) => void
  pop: () => void
}

// We use 'any' here to allow generic instantiation later
const CommandRouterContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createContext<CommandRouterContextType<any> | null>(null)

export function useCommandRouter<T extends RouteMap>() {
  const context = useContext(
    CommandRouterContext
  ) as CommandRouterContextType<T>
  if (!context)
    throw new Error('useCommandRouter must be used within a <CommandRouter>')
  return context
}

interface CommandRouterProps<T extends RouteMap> {
  children: ReactNode
  defaultPage: keyof T
}

export function CommandRouter<T extends RouteMap>({
  children,
  defaultPage
}: CommandRouterProps<T>) {
  const defaultPageSnapshot = useMemo<PageSnapshot<T>>(
    () => ({
      path: defaultPage,
      state: undefined as T[keyof T]
    }),
    [defaultPage]
  )

  // The stack state
  const [pages, setPages] = useState<PageSnapshot<T>[]>([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { path: defaultPage, state: undefined as any }
  ])

  const activePage = pages[pages.length - 1] ?? defaultPageSnapshot

  const push = useCallback(
    <K extends keyof T>(
      path: K,
      ...args: T[K] extends void | undefined ? [state?: never] : [state: T[K]]
    ) => {
      const state = args[0] as T[K]
      setPages((curr) => [...curr, { path, state }])
    },
    []
  )

  const pop = useCallback(() => {
    setPages((curr) => {
      if (curr.length <= 1) return curr
      const next = [...curr]
      next.pop()
      return next
    })
  }, [])

  return (
    // @ts-expect-error - typescript is not able to infer the type of push
    <CommandRouterContext.Provider value={{ activePage, pages, push, pop }}>
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
  const { activePage } = useCommandRouter<T>()

  if (activePage.path !== path) return null

  if (typeof children === 'function') {
    return <>{children(activePage.state as T[K])}</>
  }

  return <>{children}</>
}
