import { Fragment, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useFieldAdapter } from '@/common/fields'
import { JiraFieldContext } from '@/common/fields/types'
import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldConfirm } from './FieldConfirm'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu({ field }: { field: VisibleField }) {
  const { fieldId } = field
  const { search, setSearch } = useCommandInput()
  const { template, values, setValue } = useCreateIssueDraftStore()
  const { goToNextField, goBackToFieldsMenu } = useWizardNavigation()
  const currentValue = values[fieldId]

  const adapter = useFieldAdapter(field.metadata)
  const fieldConfig = template.fields.find((c) => c.fieldId === fieldId)
  const fieldContext = useMemo<JiraFieldContext>(
    () => ({
      ...template.scope,
      metadata: field.metadata
    }),
    [field.metadata, template.scope]
  )

  const onChange = useMemoizedFn((value: unknown) => {
    setValue(fieldId, value)
  })

  const onConfirm = useMemoizedFn(() => {
    setSearch('')
    goToNextField()
  })

  useHotkey('field.confirm-complex', onConfirm, {
    eventListenerOptions: {
      capture: true
    }
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
        inputText={search}
      />
      <FieldConfirm onClick={onConfirm} />
    </Fragment>
  )
}
