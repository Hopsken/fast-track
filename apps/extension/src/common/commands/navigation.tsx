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
  state: Record<string, unknown>
}

type NavigationStoreState = {
  stacks: NavigationEntry[]

  setRoot: (target: ReactNode) => void
  push: (target: ReactNode, onPop?: () => void) => void
  pop: (step?: number) => void
  setActiveState: (key: string, value: unknown) => void
  getActiveState: (key: string) => unknown
}

const navigationStore = createStore<NavigationStoreState>((set, get) => ({
  stacks: [],

  setRoot: (target: ReactNode) => {
    set((state) => {
      if (!state.stacks.length) {
        return {
          stacks: [{ target, state: {} }]
        }
      }

      const root = state.stacks[0]
      if (!root) return state

      return {
        stacks: [
          { target, onPop: root.onPop, state: root.state },
          ...state.stacks.slice(1)
        ]
      }
    })
  },

  push: (target: ReactNode, onPop?: () => void) => {
    set((state) => ({
      stacks: [...state.stacks, { target, onPop, state: {} }]
    }))
  },

  pop: (step: number = -1) => {
    if (step >= 0) return

    const currentStacks = get().stacks
    if (!currentStacks.length) return

    const keepLength = Math.max(1, currentStacks.length + step)
    const toPop = currentStacks.slice(keepLength)

    reverse(toPop).forEach((item) => item.onPop?.())

    set(() => ({
      stacks: currentStacks.slice(0, keepLength)
    }))
  },

  setActiveState: (key: string, value: unknown) => {
    set((state) => {
      if (!state.stacks.length) return state

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
        stacks: nextStacks
      }
    })
  },

  getActiveState: (key: string) => {
    const activeRoute = last(get().stacks)
    return activeRoute?.state[key]
  }
}))

export function NavigationProvider({ children }: PropsWithChildren) {
  const { stacks, setRoot } = useStore(
    navigationStore,
    useShallow((state) => pick(state, ['stacks', 'setRoot']))
  )

  useEffect(() => {
    setRoot(children)
  }, [children, setRoot])

  useEffect(() => {
    return () => {
      navigationStore.setState({ stacks: [] })
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
    useShallow((s) => s.stacks.length <= 1)
  )
}

export function useRouteState<T>(
  key: string,
  initial: T
): [T, (value: T) => void] {
  const value = useStore(navigationStore, (state) => {
    const routeValue = last(state.stacks)?.state[key] as T | undefined
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
