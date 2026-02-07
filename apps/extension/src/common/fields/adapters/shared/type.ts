import { FieldAdapter, FieldValueSchema } from '../../types'

export type GenericFieldAdapterOverrides<S extends FieldValueSchema> = Omit<
  FieldAdapter<S>,
  'key' | 'schema' | 'InputComponent' | 'ConfigComponent'
> &
  Partial<Pick<FieldAdapter<S>, 'InputComponent' | 'ConfigComponent'>>
