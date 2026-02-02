import { PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'

interface CommandFooterContainerStore {
  container: HTMLElement | null
  setContainer: (container: HTMLElement | null) => void
}

const useCommandFooterContainerStore = create<CommandFooterContainerStore>(
  (set) => ({
    container: null,
    setContainer: (container) => set({ container })
  })
)

/**
 * Container component that registers a DOM element as the target for footer content.
 * This should be placed where you want the footer slot content to render.
 */
export const CommandFooterContainer = () => {
  const ref = useRef<HTMLDivElement>(null)
  const setContainer = useCommandFooterContainerStore((s) => s.setContainer)

  useEffect(() => {
    if (ref.current) {
      setContainer(ref.current)
    }
    return () => setContainer(null)
  }, [setContainer])

  return <div ref={ref} />
}

/**
 * Slot component that portals its children to the CommandFooterContainer.
 * Use this to inject content into the footer from anywhere in the component tree.
 */
export const CommandFooterSlot = ({ children }: PropsWithChildren) => {
  const container = useCommandFooterContainerStore((s) => s.container)

  if (!container) return null

  return createPortal(children, container)
}

/**
 * Hook to check if the footer container is mounted.
 * Useful for conditional rendering based on container availability.
 */
export const useCommandFooterSlot = () => {
  return useCommandFooterContainerStore((s) => s.container)
}
