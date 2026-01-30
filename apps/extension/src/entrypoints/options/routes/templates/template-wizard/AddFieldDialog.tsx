import { useMemo } from 'react'
import { Badge } from '@internal/ui/components/badge'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'

import type { FieldMetadata } from '~/types/template'

export function AddFieldDialog({
  open,
  onOpenChange,
  configuredFields,
  unconfiguredFields,
  onSelect
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  configuredFields: FieldMetadata[]
  unconfiguredFields: FieldMetadata[]
  onSelect: (fieldId: string) => void
}) {
  // Sort required fields to the top of the available list
  const sortedUnconfigured = useMemo(
    () =>
      [...unconfiguredFields].sort((a, b) => {
        if (a.required === b.required) return 0
        return a.required ? -1 : 1
      }),
    [unconfiguredFields]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add field"
      description="Search and select a field to add to the template.">
      <CommandInput placeholder="Search fields…" />
      <CommandList>
        <CommandEmpty>No fields found.</CommandEmpty>

        {/* Available to add — required first */}
        {sortedUnconfigured.length > 0 && (
          <CommandGroup heading="Available">
            {sortedUnconfigured.map((f) => (
              <CommandItem
                key={f.fieldId}
                value={f.name}
                onSelect={() => onSelect(f.fieldId)}>
                <span>{f.name}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  {f.required && (
                    <Badge variant="secondary" className="text-[10px]">
                      Required
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-xs">
                    {f.schema.type}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Already configured (disabled) */}
        {configuredFields.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Already added">
              {configuredFields.map((f) => (
                <CommandItem key={f.fieldId} value={f.name} disabled>
                  <span>{f.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    Added
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
