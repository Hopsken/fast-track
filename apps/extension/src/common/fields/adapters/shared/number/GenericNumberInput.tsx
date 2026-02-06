import { ZodNumber } from 'zod'

import { CommandNumberInput } from '@/components/commands'

import { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

export const GenericNumberInput = (
  props: FieldInputComponentProps<ZodNumber>
) => {
  const { config, adapter, value, onChange, onConfirm } = props

  if (config.behavior === 'restricted' && config.allowedOptions?.length) {
    return <GenericSelectInput {...props} />
  }

  return (
    <CommandNumberInput
      title={adapter.title}
      value={value}
      onChange={onChange}
      onConfirm={onConfirm}
    />
  )
}
