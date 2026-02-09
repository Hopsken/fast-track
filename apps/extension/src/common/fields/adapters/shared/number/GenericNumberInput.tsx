import { ZodNumber } from 'zod'

import { CommandNumberInput } from '@/components/commands'

import { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

export const GenericNumberInput = (
  props: FieldInputComponentProps<ZodNumber>
) => {
  const {
    config,
    adapter,
    context,
    value,
    onChange,
    search,
    onSearchChange,
    onConfirm
  } = props

  // 限制模式：使用配置的 allowedOptions，并在前端做简单的本地过滤
  if (
    config &&
    config.behavior === 'restricted' &&
    config.allowedOptions?.length
  ) {
    return <GenericSelectInput {...props} />
  }

  // 预置模式：使用 field 的 allowedValues，并在前端做简单的本地过滤
  if (
    config &&
    config.behavior === 'preset' &&
    context.metadata.allowedValues?.length
  ) {
    return <GenericSelectInput {...props} />
  }

  // TODO: 类似 labels，无限制，但可以有 options

  return (
    <CommandNumberInput
      title={adapter.title ?? context.metadata.name}
      value={value}
      onChange={onChange}
      search={search}
      setSearch={onSearchChange}
      onConfirm={onConfirm}
    />
  )
}
