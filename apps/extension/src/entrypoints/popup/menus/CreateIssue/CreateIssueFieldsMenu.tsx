import { useMemo } from 'react'
import { CommandList } from '@internal/ui/components/command'
import { keyBy, merge, unionBy } from 'lodash-es'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { ActionLoading } from '@/components/actions'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import {
  computeVisibleFields,
  type VisibleField
} from '~/services/template-service/gap-analysis'

import { CommandRoutes } from '../../routes'

import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import { computePromotedFields } from './utils'

export function CreateIssueFieldsMenu() {
  const navigate = useNavigate()

  const { template, values, errors, promotedFieldIds, clearError } =
    useCreateIssueDraftStore()

  // Metadata & conflicts
  const { projectKey, issueTypeId } = template.scope
  const { data: fieldsMetadata, isLoading: isLoadingFields } =
    useIssueCreateMeta(projectKey, issueTypeId)

  // Compute visible fields
  const visibleFieldsBase = useMemo(() => {
    return computeVisibleFields(template, fieldsMetadata ?? [])
  }, [fieldsMetadata, template])

  const visibleFields = useMemo(() => {
    const fieldConfigById = keyBy(visibleFieldsBase, 'fieldId')
    const promotedFields = computePromotedFields({
      promotedFieldIds,
      fieldsMetadata: fieldsMetadata ?? []
    })

    return unionBy(visibleFieldsBase, promotedFields, 'fieldId').map((field) =>
      merge({}, fieldConfigById[field.fieldId], field)
    )
  }, [visibleFieldsBase, promotedFieldIds, fieldsMetadata])

  // Form submission
  const { submit } = useCreateIssueForm({
    template,
    fieldsMetadata
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
  // const [showConflictWarning, setShowConflictWarning] = useState(true)

  return (
    <CommandList>
      <ActionLoading isLoading={isLoadingFields} />

      {/* {showConflictWarning && (
        <ConflictWarning
          missingFieldNames={missingFieldNames}
          onDismiss={() => setShowConflictWarning(false)}
        />
      )} */}

      <FieldList
        fields={visibleFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />
    </CommandList>
  )
}
