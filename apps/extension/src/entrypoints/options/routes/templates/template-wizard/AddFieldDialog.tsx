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
  requiredFields,
  optionalSelected,
  optionalUnselected,
  onSelect
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requiredFields: FieldMetadata[]
  optionalSelected: FieldMetadata[]
  optionalUnselected: FieldMetadata[]
  onSelect: (fieldId: string) => void
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add field"
      description="Search and select a field to add to the template.">
      <CommandInput placeholder="Search fields…" />
      <CommandList>
        <CommandEmpty>No fields found.</CommandEmpty>

        {/* Available to add */}
        {optionalUnselected.length > 0 && (
          <CommandGroup heading="Available">
            {optionalUnselected.map((f) => (
              <CommandItem
                key={f.fieldId}
                value={f.name}
                onSelect={() => onSelect(f.fieldId)}>
                <span>{f.name}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {f.schema.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Already added (disabled) */}
        {(requiredFields.length > 0 || optionalSelected.length > 0) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Already added">
              {requiredFields.map((f) => (
                <CommandItem key={f.fieldId} value={f.name} disabled>
                  <span>{f.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    Required
                  </Badge>
                </CommandItem>
              ))}
              {optionalSelected.map((f) => (
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
