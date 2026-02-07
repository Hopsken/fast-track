import { ComponentType, useState } from 'react'
import { uniqWith } from 'lodash-es'
import { z } from 'zod'

import { FieldValueSchema, SelectComponentProps } from '../../types'

import { useFieldContext } from './context'

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

  // 删除某一项
  const handleRemove = (index: number) => {
    const newValues = [...values]
    newValues.splice(index, 1)
    onChange(newValues)
  }

  // 添加一项
  const handleAdd = (newItem: Item | Item[] | null) => {
    if (!newItem) return

    const items = Array.isArray(newItem) ? newItem : [newItem]
    onChange(uniqWith([...values, ...items], isSameValue(adapter.keyOf)))
    setIsAdding(false)
  }

  return (
    <div className="space-y-3">
      {/* 1. 列表展示区域 (Your Sketch Items) */}
      <div className="space-y-2">
        {values.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
            <span className="text-sm font-medium text-gray-700">
              {renderLabel(item)}
            </span>
            <button
              onClick={() => handleRemove(index)}
              className="p-1 text-gray-400 transition-colors hover:text-red-500"
              title="Remove restriction">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 2. 添加区域 (Value Picker) */}
      {isAdding ? (
        <div className="animate-in fade-in zoom-in-95 rounded-md border border-blue-200 bg-blue-50 p-3 duration-200">
          <div className="mb-1 text-xs font-semibold uppercase text-blue-600">
            Add allowed value
          </div>
          <SelectorComponent
            // 【关键】在添加限制条件时，始终强制为单选
            // 这样用户每次只添加一个条目，逻辑清晰
            isMultiple={false}
            value={null}
            onChange={handleAdd}
          />
          <button
            onClick={() => setIsAdding(false)}
            className="mt-2 text-xs text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:border-blue-100 hover:bg-blue-50">
          <span>+ Add allowed value</span>
        </button>
      )}
    </div>
  )
}
