import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ToastStyle = 'loading' | 'success' | 'failure' | 'warning'

export interface ToastConfig {
  style: ToastStyle
  title: string
  message?: unknown
  duration?: number
}

export interface ActiveToast extends ToastConfig {
  id: string
}

interface ToastState {
  toast?: ActiveToast
  setToast: (toast: ActiveToast) => void
  hideToast: (id: string) => void
}

const DEFAULT_DURATION = 2000

let toastId = 0
let hideTimer: ReturnType<typeof setTimeout> | undefined

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toast: undefined,
      setToast: (toast) => set({ toast }),
      hideToast: (id) => {
        clearHideTimer()
        set((state) => {
          if (state.toast?.id !== id) return state
          return { toast: undefined }
        })
      }
    }),
    { name: 'toast-store' }
  )
)

const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

const scheduleHide = (id: string, duration?: number) => {
  clearHideTimer()
  if (!duration || duration <= 0) return

  hideTimer = setTimeout(() => {
    useToastStore.getState().hideToast(id)
  }, duration)
}

export const useToastState = () => useToastStore((state) => state.toast)

export function showToast(config: ToastConfig) {
  const id = `toast-${toastId++}`
  const duration =
    config.duration ??
    (config.style === 'loading' ? undefined : DEFAULT_DURATION)
  const toast = {
    ...config,
    duration,
    id
  }

  useToastStore.getState().setToast(toast)
  scheduleHide(id, toast.duration)

  return {
    hide: () => {
      useToastStore.getState().hideToast(id)
    },
    update: (patch: Partial<ToastConfig>) => {
      const current = useToastStore.getState().toast
      if (!current || current.id !== id) return

      const nextStyle = patch.style ?? current.style
      const nextDuration =
        patch.duration ??
        current.duration ??
        (nextStyle === 'loading' ? undefined : DEFAULT_DURATION)

      const nextToast = {
        ...current,
        ...patch,
        duration: nextDuration
      }

      useToastStore.getState().setToast(nextToast)
      scheduleHide(id, nextDuration)
    }
  }
}
