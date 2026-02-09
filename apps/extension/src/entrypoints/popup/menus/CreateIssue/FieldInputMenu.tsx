import { Fragment, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { first } from 'lodash-es'

import {
  CommandPanel,
  useCommandSearch,
  useSetCommandSearch
} from '@/common/commands'
import { useFieldAdapter } from '@/common/fields'
import { JiraFieldContext } from '@/common/fields/types'
import { useHotkey } from '@/lib/hotkeys'
import { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldConfirm } from './FieldConfirm'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

function FieldInputMenuInner({ field }: { field: VisibleField }) {
  const { fieldId } = field

  const search = useCommandSearch()
  const setSearch = useSetCommandSearch()
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

  useHotkey('field.confirm-complex', onConfirm)

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
        search={search}
        onSearchChange={setSearch}
      />
      <FieldConfirm onClick={onConfirm} />
    </Fragment>
  )
}

export function FieldInputMenu({ field }: { field: VisibleField }) {
  const adapter = useFieldAdapter(field.metadata)

  const { values } = useCreateIssueDraftStore()
  const currentValue = values[field.fieldId]

  const initialValue = useMemo(() => {
    if (!currentValue) return ''

    if (Array.isArray(currentValue)) {
      const firstValue = first(currentValue)
      return adapter.keyOf(firstValue) ?? ''
    }

    return adapter.keyOf(currentValue) ?? ''
  }, [currentValue, adapter])

  // TODO: implement filter logic
  // const shouldFilter = ...

  return (
    <CommandPanel value={initialValue}>
      <FieldInputMenuInner field={field} />
    </CommandPanel>
  )
}
