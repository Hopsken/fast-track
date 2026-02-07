import {
  defineFieldAdapter,
  FieldAdapter,
  FieldAdapterKey,
  FieldValueSchema
} from '../../../types'
import { GenericFieldAdapterOverrides } from '../type'

import { GenericSelectConfig } from './GenericSelectConfig'
import { GenericSelectInput } from './GenericSelectInput'

export const createSelectFieldAdapter = <ValueSchema extends FieldValueSchema>(
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
