import { ZodString } from 'zod'

import { CommandStringInput } from '@/components/commands'

import { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

export const GenericTextInput = (
  props: FieldInputComponentProps<ZodString>
) => {
  const { config, adapter, value, context, onChange, onConfirm } = props

  // 限制模式：使用配置的 allowedOptions，并在前端做简单的本地过滤
  if (config.behavior === 'restricted' && config.allowedOptions?.length) {
    return <GenericSelectInput {...props} />
  }

  // 预置模式：使用 field 的 allowedValues，并在前端做简单的本地过滤
  if (config.behavior === 'preset' && context.metadata.allowedValues?.length) {
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
