import { createElement, Fragment } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useLocation } from 'react-router-dom'

import { useHotkey } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldConfirm } from './FieldConfirm'
import { getFieldInputComponent } from './fields/fieldRegistry'
import { SummaryDescriptionInput } from './fields/specialized'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId } = field

  const { setSearch } = useCommandInput()
  const { template, values, setValue } = useCreateIssueDraftStore()
  const { goToNextField } = useWizardNavigation()
  const currentValue = values[field.fieldId]

  const onChange = useMemoizedFn((value: unknown) => {
    setValue(fieldId, value)
  })

  const onConfirm = useMemoizedFn(() => {
    setSearch('')
    goToNextField()
  })

  const isSummaryField = fieldId === 'summary' || fieldId === 'description'

  useHotkey('field.confirm-complex', onConfirm, {
    enabled: !isSummaryField,
    eventListenerOptions: {
      capture: true
    }
  })

  // Summary + Description combined field (special case)
  if (isSummaryField) {
    return <SummaryDescriptionInput focusField={fieldId} />
  }

  const fieldConfirmBtn = <FieldConfirm onClick={onConfirm} />

  // Get component from registry
  const FieldComponent = getFieldInputComponent(field)
  const fieldElement = createElement(FieldComponent, {
    field,
    project: template.scope.project,
    issueType: template.scope.issueType,
    currentValue,
    onChange,
    onConfirm
  })

  return (
    <Fragment>
      {fieldElement}
      {fieldConfirmBtn}
    </Fragment>
  )
}
