import { ZodString } from 'zod'

import { FieldConfigComponentProps } from '../../../types'
import type { SelectComponentProps } from '../../../types'
import { isSchemaMulti } from '../../../utils'
import { GenericFieldConfig } from '../GenericFieldConfig'
import { Unsupported } from '../Unsupported'

import { TemporalSelect } from './TemporalSelect'

const DateSelect = (props: SelectComponentProps<string>) => (
  <TemporalSelect {...props} mode="date" />
)

export const DateFieldConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  if (isSchemaMulti(props.context.metadata)) {
    return <Unsupported context={props.context} />
  }

  return <GenericFieldConfig {...props} SelectorComponent={DateSelect} />
}
