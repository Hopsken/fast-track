import { ComponentType, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { uniqWith } from 'lodash-es'
import { PlusIcon, XIcon } from 'lucide-react'
import { z } from 'zod'

import { GeneralIcon } from '@/components'

import { FieldValueSchema, SelectComponentProps } from '../../types'

import { useFieldContext } from './context'
import { getIconUrl } from './select/utils'

const isSameValue = <T,>(keyOf: (item: T) => string) => {
  return (a: T, b: T) => keyOf(a) === keyOf(b)
}

interface BuildProps<T> {
  values: T[]
  onChange: (newValues: T[]) => void
  SelectorComponent: ComponentType<SelectComponentProps<T>>
}

export const RestrictedValueBuilder = <
  T extends FieldValueSchema,
  Item extends z.infer<T> = z.infer<T>
>({
  values,
  onChange,
  SelectorComponent
}: BuildProps<Item>) => {
  const { adapter } = useFieldContext<T>()

  const [isAdding, setIsAdding] = useState(false)

  function renderLabel(item: Item) {
    return adapter.labelOf?.(item) ?? adapter.keyOf(item)
  }

  function renderIcon(item: Item) {
    const iconUrl = getIconUrl(item)
    if (!iconUrl) return null
    const isUser = 'avatarUrl' in (item as object)
    return (
      <GeneralIcon alt={renderLabel(item)} iconUrl={iconUrl} rounded={isUser} />
    )
  }

  const handleRemove = (index: number) => {
    const newValues = [...values]
    newValues.splice(index, 1)
    onChange(newValues)
  }

  const handleAdd = (newItem: Item | Item[] | null) => {
    if (!newItem) return

    const items = Array.isArray(newItem) ? newItem : [newItem]
    onChange(uniqWith([...values, ...items], isSameValue(adapter.keyOf)))
    setIsAdding(false)
  }

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((item, index) => (
            <div
              key={adapter.keyOf(item)}
              className="bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm px-1.5 text-xs font-medium">
              {renderIcon(item)}
              {renderLabel(item)}
              <Button
                variant="ghost"
                size="icon-xs"
                className="-ml-1 opacity-50 hover:opacity-100"
                onClick={() => handleRemove(index)}>
                <XIcon className="pointer-events-none" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div>
          <SelectorComponent
            isMultiple={false}
            value={null}
            onChange={handleAdd}
          />
          <Button
            variant="ghost"
            size="xs"
            className="mt-1"
            onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => setIsAdding(true)}>
          <PlusIcon />
          Add value
        </Button>
      )}
    </div>
  )
}
