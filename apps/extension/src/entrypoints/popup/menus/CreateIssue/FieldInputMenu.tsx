import { Fragment, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useFieldAdapter } from '@/common/fields'
import { JiraFieldContext } from '@/common/fields/types'
import { useHotkey } from '@/lib/hotkeys'
import { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldConfirm } from './FieldConfirm'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu({ field }: { field: VisibleField }) {
  const { fieldId } = field

  const { scope, template, values, setValue } = useCreateIssueDraftStore()
  const { goBackToFieldsMenu } = useWizardNavigation()
  const currentValue = values[fieldId]

  const adapter = useFieldAdapter(field.metadata)
  const fieldConfig = template?.fields.find((c) => c.fieldId === fieldId)
  const fieldContext = useMemo<JiraFieldContext>(
    () => ({
      ...scope,
      metadata: field.metadata
    }),
    [field.metadata, scope]
  )

  const onChange = useMemoizedFn((value: unknown) => {
    setValue(fieldId, value)
  })

  const onConfirm = useMemoizedFn(() => {
    goBackToFieldsMenu()
  })

  useHotkey('field-input.escape', goBackToFieldsMenu)

  const InputComponent = adapter.InputComponent

  return (
    <Fragment>
      <InputComponent
        adapter={adapter}
        config={fieldConfig}
        context={fieldContext}
        onChange={onChange}
        onConfirm={onConfirm}
        value={currentValue}
      />
      <FieldConfirm text="Done" onClick={onConfirm} />
    </Fragment>
  )
}
