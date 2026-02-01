import { PropsWithChildren, ReactNode, useEffect } from 'react'
import { create } from 'zustand'

interface CommandFooterSlot {
  slot: ReactNode

  setSlot: (slot: ReactNode) => void
}

export const useCommandFooterSlotStore = create<CommandFooterSlot>((set) => ({
  slot: null,
  setSlot: (slot) => {
    set({ slot })
  }
}))

export const CommandFooterSlot = (props: PropsWithChildren) => {
  const setSlot = useCommandFooterSlotStore((s) => s.setSlot)

  useEffect(() => {
    setSlot(props.children)
    return () => {
      setSlot(null)
    }
  }, [props.children, setSlot])

  return null
}

export const useCommandFooterSlot = () => {
  return useCommandFooterSlotStore((s) => s.slot)
}
