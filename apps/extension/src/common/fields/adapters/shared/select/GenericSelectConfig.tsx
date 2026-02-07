import { FieldConfigComponentProps, FieldValueSchema } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

import { GeneralSelect } from './GenericSelect'

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 */
export const GenericSelectConfig = <S extends FieldValueSchema>(
  props: FieldConfigComponentProps<S>
) => {
  return <GenericFieldConfig {...props} SelectorComponent={GeneralSelect} />
}
