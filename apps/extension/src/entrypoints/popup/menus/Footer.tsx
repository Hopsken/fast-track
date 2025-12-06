import { cn } from '@internal/ui/lib/utils'
import {
  AlertTriangle,
  Check,
  CircleX,
  Loader2,
  LucideIcon,
  X
} from 'lucide-react'

import {
  ToastStyle,
  useToastState,
  useToastStore
} from '~/stores/useToastStore'

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

export function Footer() {
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
        className={cn('text-foreground group flex items-center gap-2 text-sm')}>
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

        <div className="flex-1">
          <div className="text-xs leading-5">{activeToast.title}</div>
          {activeToast.message ? (
            <div className="text-muted-foreground text-xs leading-4">
              {activeToast.message}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-linear-to-r border-t border-gray-200 px-4 py-2',
        activeToastContainerCls
      )}>
      {renderToast()}
    </div>
  )
}
