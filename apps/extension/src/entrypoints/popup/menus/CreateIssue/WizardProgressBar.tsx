import { useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform
} from 'motion/react'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { isEmptyValue } from './utils'

const PIE_RADIUS = 2
const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS

export function WizardProgressBar() {
  const { wizardFields, values } = useCreateIssueDraftStore()
  const segments = useMemo(
    () => [
      {
        fieldId: 'summary',
        isFilled: !isEmptyValue(values['summary'])
      },
      ...wizardFields.map((field) => ({
        fieldId: field.fieldId,
        isFilled: !isEmptyValue(values[field.fieldId])
      }))
    ],
    [wizardFields, values]
  )

  const filledCount = segments.filter((s) => s.isFilled).length
  const totalCount = segments.length
  const reducedMotion = useReducedMotion()
  const progressRatio =
    totalCount === 0 ? 0 : Math.min(1, filledCount / totalCount)
  const isComplete = filledCount === totalCount
  const accentColor = isComplete ? 'rgb(16 185 129)' : 'rgb(156 163 175)'
  const progress = useSpring(progressRatio, {
    stiffness: reducedMotion ? 520 : 340,
    damping: reducedMotion ? 60 : 30,
    mass: 0.4
  })
  const pieDashArray = useTransform(progress, (value) => {
    const visibleLength =
      value <= 0 ? 0.0001 : Math.min(value, 1) * PIE_CIRCUMFERENCE

    return `${visibleLength} ${PIE_CIRCUMFERENCE}`
  })

  useEffect(() => {
    progress.set(progressRatio)
  }, [progress, progressRatio])

  if (totalCount === 0) return null

  const iconTransition = reducedMotion
    ? { duration: 0.12, ease: 'linear' as const }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div
      role="progressbar"
      aria-label="Wizard progress"
      aria-valuetext={
        isComplete
          ? `All fields completed (${filledCount} of ${totalCount})`
          : `${filledCount} of ${totalCount} fields completed`
      }
      aria-valuenow={filledCount}
      aria-valuemin={0}
      aria-valuemax={totalCount}
      className="flex items-center">
      <div aria-hidden="true" className="relative h-[14px] w-[14px]">
        <AnimatePresence initial={false} mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.82, filter: 'blur(3px)' }
              }
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, filter: 'blur(2px)' }
              }
              transition={iconTransition}
              className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <Check className="size-[8px] stroke-[3.25]" />
            </motion.div>
          ) : (
            <motion.svg
              key="progress"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              initial={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.9, filter: 'blur(2px)' }
              }
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.04, filter: 'blur(3px)' }
              }
              transition={iconTransition}>
              <circle
                cx="7"
                cy="7"
                r="6"
                stroke={accentColor}
                strokeWidth="1.5"
                fill="none"
              />
              <motion.circle
                cx="7"
                cy="7"
                r={PIE_RADIUS}
                fill="none"
                stroke={accentColor}
                strokeWidth="4"
                style={{
                  strokeDasharray: pieDashArray
                }}
                transform="rotate(-90 7 7)"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
