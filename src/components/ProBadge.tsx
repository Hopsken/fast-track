import { HiLockClosed } from 'react-icons/hi2'

interface ProBadgeProps {
  isPro: boolean
  onClick?: () => void
  interactive?: boolean
}

export function ProBadge({
  isPro,
  onClick,
  interactive = false
}: ProBadgeProps) {
  const baseClasses = `rounded px-2 py-1 text-xs font-bold flex items-center gap-1 ${
    isPro ? 'text-amber-400 bg-gray-700' : 'text-gray-500 bg-gray-200'
  }`

  const classes = interactive
    ? `${baseClasses} cursor-pointer hover:opacity-80 transition-opacity`
    : baseClasses

  const content = (
    <>
      <span>Pro</span>
      {!isPro && <HiLockClosed className="h-3 w-3" />}
    </>
  )

  if (interactive && onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
