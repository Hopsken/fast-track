import { useEffect, useMemo } from 'react'
import { keyBy, merge, unionBy } from 'lodash-es'

import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { computeVisibleFields } from '@/services/template-service/gap-analysis'

import { computePromotedFields, computeWizardSequence } from './fields/utils'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'

export const useSetupWizard = () => {
  const { template, promotedFieldIds, setWizardFields } =
    useCreateIssueDraftStore()

  // Metadata & conflicts
  const {
    project: { key: projectKey },
    issueType: { id: issueTypeId }
  } = template.scope
  const { data: fieldsMetadata } = useIssueCreateMeta(projectKey, issueTypeId)

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

  // Recompute wizard fields whenever visibleFields changes
  useEffect(() => {
    if (visibleFields.length > 0) {
      setWizardFields(computeWizardSequence(visibleFields))
    }
  }, [visibleFields, setWizardFields])
}
