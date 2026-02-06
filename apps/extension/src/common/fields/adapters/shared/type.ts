import { ZodType } from 'zod'

import { FieldAdapter } from '../../types'

export type GenericFieldAdapterOverrides<S extends ZodType> = Omit<
  FieldAdapter<S>,
  'key' | 'schema' | 'InputComponent' | 'ConfigComponent'
> &
  Partial<Pick<FieldAdapter<S>, 'InputComponent' | 'ConfigComponent'>>
