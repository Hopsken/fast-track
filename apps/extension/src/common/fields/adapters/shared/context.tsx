import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { z } from 'zod'

import { FieldConfig } from '@/repository/schema'

import { FieldAdapter, FieldValueSchema, JiraFieldContext } from '../../types'

type FieldContext<T extends FieldValueSchema> = {
  adapter: FieldAdapter<T>
  config: FieldConfig<z.infer<T>>
  context: JiraFieldContext
}

const FieldContext = createContext<FieldContext<FieldValueSchema> | null>(null)

export const FieldContextProvider = <T extends FieldValueSchema>(
  props: PropsWithChildren<FieldContext<T>>
) => {
  const { children, ...restProps } = props
  const memorizedValue = useMemo<FieldContext<T>>(() => restProps, [restProps])
  return (
    <FieldContext.Provider value={memorizedValue}>
      {children}
    </FieldContext.Provider>
  )
}

export const useFieldContext = <T extends FieldValueSchema>() => {
  const context = useContext(FieldContext)
  if (!context)
    throw new Error('useFieldContext must be used in Config / Input component')
  return context as FieldContext<T>
}
