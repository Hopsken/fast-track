import type { ReactNode } from 'react'
import { cn } from '@internal/ui/lib/utils'
import { AlertCircle, Check, ChevronRight } from 'lucide-react'

import { ActionItem } from '@/common/commands'
import { useFieldAdapter } from '@/common/fields'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { formatValuePreview, isEmptyValue } from './utils'

export interface FieldListItemProps {
  field: VisibleField
  value: unknown
  error?: string
  required: boolean
  onSelect: (fieldId: string) => void
}

function getDisplayText(args: {
  fieldName: string
  valuePreview: ReactNode
  required: boolean
  isEmpty: boolean
  hasError: boolean
}) {
  const { fieldName, valuePreview, required, isEmpty, hasError } = args

  const hasValue = !isEmpty && !hasError
  const showRequired = required && isEmpty && !hasError

  if (hasError) {
    return {
      hasValue,
      showRequired,
      primaryText: fieldName,
      secondaryText: null as string | null,
      secondaryTone: 'muted' as const
    }
  }

  const hasPreview =
    valuePreview !== null && valuePreview !== undefined && valuePreview !== ''

  if (hasValue && hasPreview) {
    return {
      hasValue,
      showRequired,
      primaryText: valuePreview,
      secondaryText: fieldName,
      secondaryTone: 'muted' as const
    }
  }

  if (hasValue && !hasPreview) {
    return {
      hasValue,
      showRequired,
      primaryText: fieldName,
      secondaryText: 'Set',
      secondaryTone: 'muted' as const
    }
  }

  return {
    hasValue,
    showRequired,
    primaryText: fieldName,
    secondaryText: required ? 'Required' : null,
    secondaryTone: required ? ('required' as const) : ('muted' as const)
  }
}

export function FieldListItem({
  field,
  value,
  error,
  required,
  onSelect
}: FieldListItemProps) {
  const { fieldId, metadata } = field
  const adapter = useFieldAdapter(metadata)

  const fieldName = adapter.title ?? metadata.name
  const isEmpty = isEmptyValue(value, adapter)
  const valuePreview = formatValuePreview(value, adapter)
  const hasError = !!error

  const actionItemValue = `field:${fieldId}`

  const display = getDisplayText({
    fieldName,
    valuePreview,
    required,
    isEmpty,
    hasError
  })

  const secondaryTextColor =
    display.secondaryTone === 'required'
      ? 'text-rose-600'
      : 'text-muted-foreground'

  let detail: ReactNode = null
  if (hasError) {
    detail = (
      <div className="flex min-w-0 items-center gap-1 text-xs text-rose-600">
        <AlertCircle className="size-3 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{error}</span>
      </div>
    )
  } else if (display.secondaryText) {
    detail = (
      <div className={cn('truncate text-xs', secondaryTextColor)}>
        {display.secondaryText}
      </div>
    )
  }

  return (
    <ActionItem
      value={actionItemValue}
      keywords={[fieldName]}
      onSelect={() => onSelect(fieldId)}
      className={cn(hasError && 'border-l-2 border-l-rose-500')}>
      <div className="flex flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm font-medium',
                hasError && 'text-rose-700'
              )}>
              {display.primaryText}
            </span>

            {display.showRequired ? (
              <span className="text-rose-500" aria-hidden="true">
                *
              </span>
            ) : null}
          </div>

          {detail}
        </div>

        {display.hasValue ? (
          <Check className="size-4 shrink-0 text-emerald-600" />
        ) : null}

        <ChevronRight className="text-muted-foreground size-4 shrink-0" />
      </div>
    </ActionItem>
  )
}
