import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

export interface NavigationBreadcrumbProps {
  segments: string[]
  /** Index of the segment that was just added — only this one animates in. */
  newSegmentIndex?: number
}

export function NavigationBreadcrumb({
  segments,
  newSegmentIndex
}: NavigationBreadcrumbProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!segments.length) return null

  return (
    <div className="flex shrink-0 items-center gap-1">
      {segments.map((segment, i) => {
        const isNew = i === newSegmentIndex && !shouldReduceMotion

        return (
          <Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                size={12}
                className="text-muted-foreground shrink-0 opacity-40"
              />
            )}
            {isNew ? (
              <motion.span
                className="text-muted-foreground max-w-[120px] truncate text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}>
                {segment}
              </motion.span>
            ) : (
              <span className="text-muted-foreground max-w-[120px] truncate text-xs">
                {segment}
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
