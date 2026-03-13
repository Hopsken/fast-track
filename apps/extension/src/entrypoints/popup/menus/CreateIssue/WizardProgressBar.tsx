import { useMemo } from 'react'
import { cn } from '@internal/ui/lib/utils'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { isEmptyValue } from './utils'

const PROGRESS_STEPS = 4

function getQuarterProgressStep(filledCount: number, totalCount: number) {
  if (totalCount === 0) return 0

  return Math.min(
    PROGRESS_STEPS,
    Math.ceil((filledCount / totalCount) * PROGRESS_STEPS)
  )
}

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

  if (totalCount === 0) return null

  const progressStep = getQuarterProgressStep(filledCount, totalCount)
  const progressDegrees = progressStep * 90
  const progressLabel =
    progressStep === PROGRESS_STEPS ? 'All set' : `${progressStep}/4`

  return (
    <div
      role="progressbar"
      aria-label={`Wizard progress: ${progressLabel}`}
      aria-valuetext={`${progressLabel} (${filledCount} of ${totalCount} fields completed)`}
      aria-valuenow={progressStep}
      aria-valuemin={0}
      aria-valuemax={PROGRESS_STEPS}
      className="flex items-center gap-1.5">
      <div
        aria-hidden="true"
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 p-0.5 transition-all duration-300',
          progressStep === PROGRESS_STEPS && 'border-emerald-500'
        )}
        style={{
          backgroundImage: `conic-gradient(rgb(16 185 129) 0deg ${progressDegrees}deg, rgb(229 231 235) ${progressDegrees}deg 360deg)`
        }}>
        <div className="h-full w-full rounded-full bg-white" />
      </div>
      <span className="text-xs font-medium text-gray-500">{progressLabel}</span>
      {segments.map((segment) => (
        <span key={segment.fieldId} className="sr-only">
          {segment.fieldId}: {segment.isFilled ? 'completed' : 'pending'}
        </span>
      ))}
    </div>
  )
}
