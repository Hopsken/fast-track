import { useMemo } from 'react'
import { cn } from '@internal/ui/lib/utils'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { isEmptyValue } from './utils'

export function WizardProgressBar() {
  const { wizardFields, values } = useCreateIssueDraftStore()
  const segments = useMemo(
    () =>
      wizardFields.map((field) => ({
        fieldId: field.fieldId,
        isFilled: !isEmptyValue(values[field.fieldId])
      })),
    [wizardFields, values]
  )

  const filledCount = segments.filter((s) => s.isFilled).length
  const totalCount = segments.length

  if (totalCount === 0) return null

  return (
    <div
      role="progressbar"
      aria-label={`Wizard progress: ${filledCount} of ${totalCount} fields completed`}
      aria-valuenow={filledCount}
      aria-valuemin={0}
      aria-valuemax={totalCount}
      className="flex gap-0.5">
      {segments.map((segment) => (
        <div
          key={segment.fieldId}
          className={cn(
            'h-3 w-1 rounded-full transition-all duration-300',
            segment.isFilled
              ? 'scale-105 bg-green-500'
              : 'scale-100 bg-gray-200'
          )}
        />
      ))}
    </div>
  )
}
