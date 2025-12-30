import { useId, useLayoutEffect } from 'react'
import { useUnmount } from 'ahooks'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface LoadingState {
  active: Set<string>
  start: (key: string) => void
  complete: (key: string) => void
}

const useLoadingIndicatorStore = create<LoadingState>()(
  devtools(
    (set, get) => ({
      active: new Set<string>(),

      start: (key: string) => {
        const active = get().active
        active.add(key)
        set({ active: new Set(active) })
      },

      complete: (key: string) => {
        const active = get().active
        active.delete(key)
        set({ active: new Set(active) })
      }
    }),
    { name: 'loading-indicator-store' }
  )
)

export function useLoadingIndicator(isLoading: boolean | undefined) {
  const componentId = useId()

  useLayoutEffect(() => {
    const { start, complete } = useLoadingIndicatorStore.getState()
    if (isLoading) {
      start(componentId)
    } else {
      complete(componentId)
    }
  }, [componentId, isLoading])

  useUnmount(() => {
    const { complete } = useLoadingIndicatorStore.getState()
    complete(componentId)
  })
}

/**
 * Hook for the command UI to show a global loading indicator
 * when any tracked query is loading.
 */
export function useIsCommandLoading() {
  return useLoadingIndicatorStore((state) => state.active.size > 0)
}
