import { CommandItem } from '@internal/ui/components/command'
import { cn } from '@internal/ui/lib/utils'
import { AlertCircle, Check, ChevronRight } from 'lucide-react'

import { useFieldAdapter } from '@/common/fields'
import type { VisibleField } from '~/services/template-service/gap-analysis'



export interface FieldListItemProps {
  field: VisibleField
  value: unknown
  error?: string
  required: boolean
  onSelect: (fieldId: string) => void
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

  const fieldName = adapter.title ?? metadata.
  const isEmpty = isEmptyValue(value)
  const valuePreview = formatValuePreview(value)
  const hasError = !!error

  const searchValue = `field:${fieldId} ${fieldName}`

  return (
    <CommandItem
      value={searchValue}
      onSelect={() => onSelect(fieldId)}
      className={cn(hasError && 'border-l-2 border-l-rose-500')}>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-sm', hasError && 'text-rose-700')}>
              {fieldName}
            </span>
            {required && <span className="text-rose-500">*</span>}
          </div>

          {hasError ? (
            <div className="flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="size-3 shrink-0" />
              <span>{error}</span>
            </div>
          ) : valuePreview ? (
            <div className="text-muted-foreground truncate text-xs">
              {valuePreview}
            </div>
          ) : null}
        </div>

        {!isEmpty && !hasError && (
          <Check className="size-4 shrink-0 text-emerald-600" />
        )}

        <ChevronRight className="text-muted-foreground size-4 shrink-0" />
      </div>
    </CommandItem>
  )
}
