import { useMemo, useState } from 'react'
import { CommandEmpty, CommandList } from '@internal/ui/components/command'
import { useHotkeys } from 'react-hotkeys-hook'

import { useFieldMetadataCache } from '@/hooks/useFieldMetadataCache'
import { useTemplateConflicts } from '@/hooks/useTemplateConflicts'
import { useTemplates } from '@/hooks/useTemplates'
import {
  computeVisibleFields,
  type VisibleField
} from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { ConflictWarning } from './ConflictWarning'
import { CreateIssueActions } from './CreateIssueActions'
import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import {
  buildInitialValues,
  computeFinalVisibleFields,
  toCacheKey
} from './utils'

export type CreateIssueMenuProps = {
  template: IssueTemplate
}

declare global {
  interface RouteMap {
    '/create-issue': CreateIssueMenuProps
  }
}

export function CreateIssueMenu({ template }: CreateIssueMenuProps) {
  const {
    values,
    errors,
    promotedFieldIds,
    initDraft,
    setValue,
    clearError,
    reset
  } = useCreateIssueDraftStore()

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

  // Initialize draft on mount
  const [initialized, setInitialized] = useState(false)
  useMemo(() => {
    if (template && visibleFieldsBase.length > 0 && !initialized) {
      const initial = buildInitialValues({
        template,
        visibleFields: visibleFieldsBase
      })
      initDraft(template.id, initial)
      setInitialized(true)
    }
  }, [template, visibleFieldsBase, initialized, initDraft])

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
  const handleSelectField = (fieldId: string) => {
    clearError(fieldId)
    // push('/create-issue/field-input', { fieldId, templateId: template.id })
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

  // Partition fields by required status
  const requiredFieldIds = useMemo(() => {
    if (!cache) return new Set<string>()
    return new Set(cache.fields.filter((f) => f.required).map((f) => f.fieldId))
  }, [cache])

  const requiredFields: VisibleField[] = []
  const optionalFields: VisibleField[] = []

  for (const field of visibleFields) {
    if (requiredFieldIds.has(field.fieldId)) {
      requiredFields.push(field)
    } else {
      optionalFields.push(field)
    }
  }

  return (
    <CommandList>
      {showConflictWarning && (
        <ConflictWarning
          missingFieldNames={missingFieldNames}
          onDismiss={() => setShowConflictWarning(false)}
        />
      )}

      <FieldList
        heading="Required"
        fields={requiredFields}
        values={values}
        errors={errors}
        requiredFieldIds={requiredFieldIds}
        onSelectField={handleSelectField}
      />

      <FieldList
        heading="Optional"
        fields={optionalFields}
        values={values}
        errors={errors}
        requiredFieldIds={requiredFieldIds}
        onSelectField={handleSelectField}
      />

      <CreateIssueActions onSubmit={submit} />
    </CommandList>
  )
}
