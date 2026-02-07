import { ComponentType } from 'react'
import { z } from 'zod'

import { UnwrapArray } from '@/utils/type-utils'

import {
  FieldConfigComponentProps,
  FieldValueSchema,
  SelectComponentProps
} from '../../types'
import { isSchemaMulti } from '../../utils'

import { FieldContextProvider } from './context'
import { RestrictedValueBuilder } from './RestrictedValueBuilder'

export interface GenericFieldConfigProps<T extends FieldValueSchema>
  extends FieldConfigComponentProps<T> {
  SelectorComponent: ComponentType<SelectComponentProps<z.infer<T>>>
}

export const GenericFieldConfig = <T extends FieldValueSchema>(
  props: GenericFieldConfigProps<T>
) => {
  type Value = z.infer<T>
  const { adapter, config, context, SelectorComponent, onChangeConfig } = props

  const { metadata } = context
  const isFieldMulti = isSchemaMulti(metadata)

  function renderConfig() {
    const { behavior } = config
    if (behavior === 'restricted') {
      return (
        <RestrictedValueBuilder
          values={(config.allowedOptions ?? []) as Value[]}
          onChange={(newValues) =>
            onChangeConfig({
              ...config,
              allowedOptions: newValues as UnwrapArray<Value>[]
            })
          }
          SelectorComponent={props.SelectorComponent}
        />
      )
    }

    if (behavior === 'preset') {
      return (
        <SelectorComponent
          isMultiple={isFieldMulti}
          value={config.presetValue}
          onChange={(newValue) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChangeConfig({ ...config, presetValue: newValue as any })
          }
        />
      )
    }

    return null
  }

  return (
    <FieldContextProvider adapter={adapter} config={config} context={context}>
      {renderConfig()}
    </FieldContextProvider>
  )
}
