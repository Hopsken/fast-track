import { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { last, pick, reverse } from 'lodash-es'
import { createStore, useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

type NavigationItem = {
  target: ReactNode
  onPop?: () => void
}

type NavigationStoreState = {
  stacks: NavigationItem[]

  push: (target: ReactElement, onPop?: () => void) => void
  pop: (step?: number) => void
}

const navigationStore = createStore<NavigationStoreState>((set, get) => ({
  stacks: [],

  push: (target: ReactNode, onPop?: () => void) => {
    set((state) => ({ stacks: [...state.stacks, { target, onPop }] }))
  },

  pop: (step: number = -1) => {
    if (step >= 0) return
    const toPop = get().stacks.slice(step)
    reverse(toPop).forEach((item) => item.onPop?.())
    set((state) => ({
      // ensure at least one stack
      stacks: state.stacks.slice(0, Math.max(0, state.stacks.length + step))
    }))
  }
}))

export function NavigationProvider({ children }: PropsWithChildren) {
  const { stacks } = useStore(navigationStore)
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
    useShallow((s) => !s.stacks.length)
  )
}
