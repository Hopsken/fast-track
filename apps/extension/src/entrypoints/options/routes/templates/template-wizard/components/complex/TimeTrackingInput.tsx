import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'

import type { TimeTrackingInputProps } from '../../types'

/**
 * Time tracking input with two fields: original estimate and remaining estimate.
 * Accepts Jira time format (e.g., "2w 3d 4h").
 */
export function TimeTrackingInput({ value, onChange }: TimeTrackingInputProps) {
  const originalEstimate = value?.originalEstimate ?? ''
  const remainingEstimate = value?.remainingEstimate ?? ''

  const handleOriginalChange = (newValue: string) => {
    onChange({
      ...value,
      originalEstimate: newValue.length > 0 ? newValue : undefined
    })
  }

  const handleRemainingChange = (newValue: string) => {
    onChange({
      ...value,
      remainingEstimate: newValue.length > 0 ? newValue : undefined
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="original-estimate" className="text-sm">
          Original Estimate
        </Label>
        <Input
          id="original-estimate"
          type="text"
          placeholder="e.g., 2w 3d 4h"
          value={originalEstimate}
          onChange={(e) => handleOriginalChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="remaining-estimate" className="text-sm">
          Remaining Estimate
        </Label>
        <Input
          id="remaining-estimate"
          type="text"
          placeholder="e.g., 1w 2d"
          value={remainingEstimate}
          onChange={(e) => handleRemainingChange(e.target.value)}
        />
      </div>

      <p className="text-muted-foreground text-xs">
        Format: w (weeks), d (days), h (hours), m (minutes)
        <br />
        Example: "2w 3d 4h" = 2 weeks, 3 days, 4 hours
      </p>
    </div>
  )
}
