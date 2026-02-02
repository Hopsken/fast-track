import { cn } from '@/lib/utils'

interface LoadingCursorProps {
  /**
   * The cursor character to display
   * @default "▊"
   */
  cursor?: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Blink speed in milliseconds
   * @default 530
   */
  blinkSpeed?: number
}

/**
 * A terminal-style blinking cursor loading indicator
 */
export function LoadingCursor({
  cursor = '▊',
  className,
  blinkSpeed = 530
}: LoadingCursorProps) {
  return (
    <span
      className={cn('inline-block animate-pulse', className)}
      style={{
        animationDuration: `${blinkSpeed}ms`
      }}
      aria-label="Loading"
      role="status">
      {cursor}
    </span>
  )
}
