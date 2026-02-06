import { ZodType } from 'zod'

import {
  defineFieldAdapter,
  FieldAdapter,
  FieldAdapterKey
} from '../../../types'
import { GenericFieldAdapterOverrides } from '../type'

import { GenericSelectConfig } from './GenericSelectConfig'
import { GenericSelectInput } from './GenericSelectInput'

export const createSelectFieldAdapter = <ValueSchema extends ZodType>(
  key: FieldAdapterKey,
  schema: ValueSchema,
  overrides: GenericFieldAdapterOverrides<ValueSchema>
): FieldAdapter<ValueSchema> => {
  const { InputComponent, ConfigComponent, ...restConfig } = overrides
  return defineFieldAdapter<ValueSchema>({
    key,
    schema: schema,
    InputComponent: InputComponent ?? GenericSelectInput,
    ConfigComponent: ConfigComponent ?? GenericSelectConfig,

    ...restConfig
  })
}
