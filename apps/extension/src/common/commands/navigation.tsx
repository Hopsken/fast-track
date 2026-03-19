import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react'
import { last, pick, reverse } from 'lodash-es'
import { createStore, useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

type NavigationEntry = {
  target: ReactNode
  onPop?: () => void
  /** Breadcrumb segments contributed by this entry (1 for normal push, 2+ for direct deep navigation). */
  breadcrumb?: string[]
  state: Record<string, unknown>
}

type PushOptions = {
  onPop?: () => void
  /** Single breadcrumb label for this entry. */
  title?: string
  /** Multi-segment breadcrumb — use when skipping intermediate levels (e.g. directly opening Status from the ticket list). Takes precedence over `title`. */
  breadcrumb?: string[]
}

type NavigationStoreState = {
  /**
   * Root entry state (when no stacks are pushed).
   * We intentionally do not store the root ReactNode in the store to avoid
   * lifecycle races (effects) and unnecessary store updates when children change.
   */
  rootState: Record<string, unknown>

  /**
   * Pushed navigation entries (excluding root).
   */
  stacks: NavigationEntry[]

  /** Direction of the most recent navigation action. Used to animate only new breadcrumb segments. */
  lastNavAction: 'push' | 'pop' | null

  push: (target: ReactNode, options?: PushOptions) => void
  pop: (step?: number) => void

  setActiveState: (key: string, value: unknown) => void
  clearActiveState: (key: string) => void
  getActiveState: (key: string) => unknown
}

const navigationStore = createStore<NavigationStoreState>((set, get) => ({
  rootState: {},
  stacks: [],
  lastNavAction: null,

  push: (target: ReactNode, options?: PushOptions) => {
    const breadcrumb =
      options?.breadcrumb ?? (options?.title ? [options.title] : undefined)
    set((state) => ({
      stacks: [
        ...state.stacks,
        { target, onPop: options?.onPop, breadcrumb, state: {} }
      ],
      lastNavAction: 'push'
    }))
  },

  pop: (step: number = -1) => {
    if (step >= 0) return

    const currentStacks = get().stacks
    if (!currentStacks.length) return

    const keepLength = Math.max(0, currentStacks.length + step)
    const toPop = currentStacks.slice(keepLength)

    reverse(toPop).forEach((item) => item.onPop?.())

    set(() => ({
      stacks: currentStacks.slice(0, keepLength),
      lastNavAction: 'pop'
    }))
  },

  setActiveState: (key: string, value: unknown) => {
    set((state) => {
      if (!state.stacks.length) {
        return {
          ...state,
          rootState: {
            ...state.rootState,
            [key]: value
          }
        }
      }

      const nextStacks = [...state.stacks]
      const activeIndex = nextStacks.length - 1
      const activeRoute = nextStacks[activeIndex]
      if (!activeRoute) return state

      nextStacks[activeIndex] = {
        ...activeRoute,
        state: {
          ...activeRoute.state,
          [key]: value
        }
      }

      return {
        ...state,
        stacks: nextStacks
      }
    })
  },

  clearActiveState: (key: string) => {
    set((state) => {
      if (!state.stacks.length) {
        if (!(key in state.rootState)) return state
        const next = { ...state.rootState }
        delete next[key]
        return { ...state, rootState: next }
      }

      const nextStacks = [...state.stacks]
      const activeIndex = nextStacks.length - 1
      const activeRoute = nextStacks[activeIndex]
      if (!activeRoute) return state
      if (!(key in activeRoute.state)) return state

      const nextState = { ...activeRoute.state }
      delete nextState[key]

      nextStacks[activeIndex] = {
        ...activeRoute,
        state: nextState
      }

      return {
        ...state,
        stacks: nextStacks
      }
    })
  },

  getActiveState: (key: string) => {
    const { stacks, rootState } = get()
    if (!stacks.length) return rootState[key]

    const activeRoute = last(stacks)
    return activeRoute?.state[key]
  }
}))

export function NavigationProvider({ children }: PropsWithChildren) {
  const stacks = useStore(navigationStore, (state) => state.stacks)

  useEffect(() => {
    return () => {
      navigationStore.setState({
        stacks: [],
        rootState: {},
        lastNavAction: null
      })
    }
  }, [])

  const activeEl = last(stacks)
  return activeEl ? activeEl.target : children
}

export function useNavigation() {
  return useStore(
    navigationStore,
    useShallow((s) => pick(s, ['pop', 'push']))
  )
}

export function useIsNavigationRoot() {
  return useStore(
    navigationStore,
    useShallow((s) => s.stacks.length === 0)
  )
}

export function useRouteState<T>(
  key: string,
  initial: T
): [T, (value: T) => void] {
  const value = useStore(navigationStore, (state) => {
    const activeRoute = last(state.stacks)
    const activeState = activeRoute?.state ?? state.rootState
    const routeValue = activeState[key] as T | undefined
    return routeValue ?? initial
  })

  const setActiveState = useStore(
    navigationStore,
    (state) => state.setActiveState
  )

  const setValue = useCallback(
    (nextValue: T) => {
      setActiveState(key, nextValue)
    },
    [key, setActiveState]
  )

  return [value, setValue]
}

export function useClearRouteState(key: string) {
  const clearActiveState = useStore(
    navigationStore,
    (state) => state.clearActiveState
  )

  return useCallback(() => {
    clearActiveState(key)
  }, [clearActiveState, key])
}

const NavigateBackContext = createContext<{
  onNavigateBack?: () => void
}>({ onNavigateBack: undefined })

export const NavigateBackProvider = ({
  onNavigateBack,
  children
}: PropsWithChildren<{
  onNavigateBack: () => void
}>) => {
  const value = useMemo(() => ({ onNavigateBack }), [onNavigateBack])
  return (
    <NavigateBackContext.Provider value={value}>
      {children}
    </NavigateBackContext.Provider>
  )
}

export const useNavigateBack = () =>
  useContext(NavigateBackContext).onNavigateBack

export function useLastNavAction() {
  return useStore(navigationStore, (s) => s.lastNavAction)
}

export function useNavigationBreadcrumb(): string[] {
  return useStore(
    navigationStore,
    useShallow((s) => s.stacks.flatMap((e) => e.breadcrumb ?? []))
  )
}
