import { ZodType } from 'zod'

import {
  defineFieldAdapter,
  FieldAdapter,
  FieldAdapterKey
} from '../../../types'

import { GenericSelectConfig } from './GenericSelectConfig'
import { GenericSelectInput } from './GenericSelectInput'

export const createSelectFieldAdapter = <ValueSchema extends ZodType>(
  key: FieldAdapterKey,
  schema: ValueSchema,
  overrides: Omit<
    FieldAdapter<ValueSchema>,
    'key' | 'schema' | 'InputComponent' | 'ConfigComponent'
  > &
    Partial<
      Pick<FieldAdapter<ValueSchema>, 'InputComponent' | 'ConfigComponent'>
    >
) => {
  const { InputComponent, ConfigComponent, ...restConfig } = overrides
  return defineFieldAdapter<ValueSchema>({
    key,
    schema: schema,
    InputComponent: InputComponent ?? GenericSelectInput,
    ConfigComponent: ConfigComponent ?? GenericSelectConfig,

    ...restConfig
  })
}
