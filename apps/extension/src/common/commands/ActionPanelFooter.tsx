import { PropsWithChildren, useEffect, useRef } from 'react'
import { cn } from '@internal/ui/lib/utils'
import {
  AlertTriangle,
  Check,
  CircleX,
  Loader2,
  LucideIcon,
  X
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'

import {
  ToastStyle,
  useToastState,
  useToastStore
} from '@/stores/command/useToastStore'
import { openOptionsPage } from '@/utils'
import { formatErrorMessage } from '@/utils/formatError'
import logoPNG from '~/assets/logo.png'

const toastThemes: Record<
  ToastStyle,
  { icon: LucideIcon; container: string; iconColor: string }
> = {
  success: {
    icon: Check,
    container: 'from-emerald-50 via-emerald-50 to-white ',
    iconColor: 'text-emerald-600'
  },
  failure: {
    icon: CircleX,
    container: 'from-rose-50 via-rose-50 to-white ',
    iconColor: 'text-rose-600'
  },
  warning: {
    icon: AlertTriangle,
    container: 'from-amber-50 via-amber-50 to-white ',
    iconColor: 'text-amber-600'
  },
  loading: {
    icon: Loader2,
    container: 'from-slate-50 via-slate-50 to-white ',
    iconColor: 'text-slate-500 animate-spin'
  }
}

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
const PanelFooterContainer = () => {
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
export const ActionPanelSlot = ({ children }: PropsWithChildren) => {
  const container = useCommandFooterContainerStore((s) => s.container)

  if (!container) return null

  return createPortal(children, container)
}

export function ActionPanelFooter() {
  const activeToast = useToastState()
  const hideToast = useToastStore((state) => state.hideToast)

  const activeToastContainerCls = activeToast
    ? toastThemes[activeToast.style].container
    : ''

  function renderToast() {
    if (!activeToast) return null

    const theme = toastThemes[activeToast.style]
    const Icon = theme.icon

    const onClose = () => hideToast(activeToast.id)

    return (
      <div
        className={cn('text-foreground group flex items-center gap-2 text-xs')}>
        <div className="relative">
          <Icon
            className={cn(
              'size-4 shrink-0 group-hover:opacity-0',
              theme.iconColor
            )}
          />

          <button
            type="button"
            aria-label="Hide toast"
            onClick={onClose}
            className="text-muted-foreground absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 text-xs">
          <span>{activeToast.title}</span>
          {activeToast.message ? (
            <span className="text-muted-foreground">
              {' '}
              - {formatErrorMessage(activeToast.message)}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  function renderFooter() {
    return (
      <div className="flex items-center justify-between">
        <button
          onClick={() => openOptionsPage()}
          className={cn(
            'text-foreground group flex cursor-pointer items-center gap-2 text-xs'
          )}>
          <img
            src={logoPNG}
            alt="Fast Track"
            className="size-4 rounded grayscale transition group-hover:grayscale-0"
          />

          <span className="flex-1 text-xs">
            <span className="group-hover:hidden">Fast Track</span>
            <span className="hidden opacity-0 transition group-hover:block group-hover:opacity-100">
              Settings
            </span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-linear-to-r h-11 border-t border-gray-200 px-5 py-2',
        activeToastContainerCls
      )}>
      <div className="flex h-6 items-center justify-between">
        {activeToast ? renderToast() : renderFooter()}
        <PanelFooterContainer />
      </div>
    </div>
  )
}
