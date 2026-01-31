import { useMemo, useState } from 'react'
import { CommandList } from '@internal/ui/components/command'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { useFieldMetadataCache } from '@/hooks/useFieldMetadataCache'
import { useTemplateConflicts } from '@/hooks/useTemplateConflicts'
import {
  computeVisibleFields,
  type VisibleField
} from '~/services/template-service/gap-analysis'

import { CommandRoutes } from '../../routes'

import { ConflictWarning } from './ConflictWarning'
import { CreateIssueActions } from './CreateIssueActions'
import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import { computeFinalVisibleFields, toCacheKey } from './utils'

export function CreateIssueFieldsMenu() {
  const navigate = useNavigate()

  const { template, values, errors, promotedFieldIds, clearError } =
    useCreateIssueDraftStore()

  // Metadata & conflicts
  const cacheKey = useMemo(() => toCacheKey(template), [template])
  const { data: cache } = useFieldMetadataCache(cacheKey)
  const { data: conflicts } = useTemplateConflicts(cacheKey)

  // Compute visible fields
  const visibleFieldsBase = useMemo(() => {
    if (!template || !cache) return []
    return computeVisibleFields(template, cache, conflicts ?? [])
  }, [template, cache, conflicts])

  const visibleFields = useMemo(() => {
    if (!cache) return visibleFieldsBase
    return computeFinalVisibleFields({
      base: visibleFieldsBase,
      promotedFieldIds,
      cacheFields: cache.fields
    })
  }, [visibleFieldsBase, promotedFieldIds, cache])

  // Form submission
  const { submit } = useCreateIssueForm({
    templateId: template?.id ?? '',
    template: template!,
    cache
  })

  // Hotkey
  useHotkeys(
    'meta+enter',
    () => {
      submit()
    },
    {
      preventDefault: true,
      enableOnFormTags: true
    },
    [submit]
  )

  // Field selection handler
  const handleSelectField = (field: VisibleField) => {
    clearError(field.fieldId)
    navigate(CommandRoutes.CreateIssueEditField, { state: { field } })
  }

  // Conflict warning state
  const [showConflictWarning, setShowConflictWarning] = useState(true)
  const missingFieldNames = useMemo(() => {
    if (!conflicts || conflicts.length === 0 || !cache) return []
    return conflicts.map(
      (c) =>
        cache.fields.find((f) => f.fieldId === c.fieldId)?.name ?? c.fieldId
    )
  }, [conflicts, cache])

  return (
    <CommandList>
      {showConflictWarning && (
        <ConflictWarning
          missingFieldNames={missingFieldNames}
          onDismiss={() => setShowConflictWarning(false)}
        />
      )}

      <FieldList
        fields={visibleFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />

      <CreateIssueActions onSubmit={submit} />
    </CommandList>
  )
}
