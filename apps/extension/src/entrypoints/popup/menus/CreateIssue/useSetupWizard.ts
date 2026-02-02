import { useMemo, useEffect } from '#imports'
import { keyBy, unionBy, merge } from 'lodash-es'
import { useNavigate } from 'react-router-dom'

import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { computeVisibleFields } from '@/services/template-service/gap-analysis'

import { CommandRoutes } from '../../routes'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { computePromotedFields, computeWizardSequence } from './utils'

export const useSetupWizard = () => {
  const navigate = useNavigate()

  const {
    template,
    promotedFieldIds,
    wizardStarted,
    setWizardFields,
    setWizardStarted,
    setWizardIndex
  } = useCreateIssueDraftStore()

  // Metadata & conflicts
  const { projectKey, issueTypeId } = template.scope
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

  // Auto-start wizard on first metadata load
  useEffect(() => {
    if (!wizardStarted && visibleFields.length > 0) {
      const sequence = computeWizardSequence(visibleFields)
      setWizardFields(sequence)
      setWizardStarted(true)
    }
  }, [
    visibleFields,
    wizardStarted,
    setWizardFields,
    setWizardStarted,
    setWizardIndex,
    navigate
  ])
}
