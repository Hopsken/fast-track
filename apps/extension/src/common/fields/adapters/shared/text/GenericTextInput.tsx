import { ZodString } from 'zod'

import { CommandStringInput } from '@/components/commands'

import { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

export const GenericTextInput = (
  props: FieldInputComponentProps<ZodString>
) => {
  const { config, adapter, value, onChange, onConfirm } = props

  if (config.behavior === 'restricted' && config.allowedOptions?.length) {
    return <GenericSelectInput {...props} />
  }

  return (
    <CommandStringInput
      title={adapter.title}
      value={value}
      onChange={onChange}
      onConfirm={onConfirm}
    />
  )
}
