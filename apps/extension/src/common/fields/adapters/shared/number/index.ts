import { ZodNumber } from 'zod'

import {
  defineFieldAdapter,
  FieldAdapter,
  FieldAdapterKey
} from '../../../types'
import { GenericFieldAdapterOverrides } from '../type'

import { GenericNumberConfig } from './GenericNumberConfig'
import { GenericNumberInput } from './GenericNumberInput'

export const createNumberFieldAdapter = (
  key: FieldAdapterKey,
  schema: ZodNumber,
  overrides: GenericFieldAdapterOverrides<ZodNumber>
): FieldAdapter<ZodNumber> => {
  const { InputComponent, ConfigComponent, ...restConfig } = overrides
  return defineFieldAdapter<ZodNumber>({
    key,
    schema: schema,

    InputComponent: InputComponent ?? GenericNumberInput,
    ConfigComponent: ConfigComponent ?? GenericNumberConfig,

    ...restConfig
  })
}
