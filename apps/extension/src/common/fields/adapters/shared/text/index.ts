import { ZodString } from 'zod'

import {
  defineFieldAdapter,
  FieldAdapter,
  FieldAdapterKey
} from '../../../types'
import { GenericFieldAdapterOverrides } from '../type'

import { GenericTextConfig } from './GenericTextConfig'
import { GenericTextInput } from './GenericTextInput'

export const createTextFieldAdapter = (
  key: FieldAdapterKey,
  schema: ZodString,
  overrides: GenericFieldAdapterOverrides<ZodString>
): FieldAdapter<ZodString> => {
  const { InputComponent, ConfigComponent, ...restConfig } = overrides
  return defineFieldAdapter<ZodString>({
    key,
    schema: schema,
    InputComponent: InputComponent ?? GenericTextInput,
    ConfigComponent: ConfigComponent ?? GenericTextConfig,

    ...restConfig
  })
}
