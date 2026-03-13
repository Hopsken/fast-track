import { useEffect, useMemo } from 'react'
import { keyBy, merge, unionBy } from 'lodash-es'

import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import {
  computeVisibleFields,
  computeVisibleFieldsFromMeta
} from '@/services/template-service/gap-analysis'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { computePromotedFields, computeWizardSequence } from './utils'

export const useSetupWizard = () => {
  const { scope, template, promotedFieldIds, setWizardFields } =
    useCreateIssueDraftStore()

  // Metadata & conflicts
  const { data: fieldsMetadata } = useIssueCreateMeta(
    scope.project.key,
    scope.issueType.id
  )

  // Compute visible fields
  const visibleFieldsBase = useMemo(() => {
    if (template) {
      return computeVisibleFields(template, fieldsMetadata ?? [])
    }
    return computeVisibleFieldsFromMeta(fieldsMetadata ?? [])
  }, [fieldsMetadata, template])

  const visibleFields = useMemo(() => {
    const fieldConfigById = keyBy(visibleFieldsBase, 'fieldId')
    const promotedFields = computePromotedFields({
      promotedFieldIds,
      fieldsMetadata: fieldsMetadata ?? []
    })

    return unionBy(visibleFieldsBase, promotedFields, 'fieldId').map((field) =>
      merge({}, fieldConfigById[field.fieldId] ?? {}, field)
    )
  }, [visibleFieldsBase, promotedFieldIds, fieldsMetadata])

  // Recompute wizard fields whenever visibleFields changes
  useEffect(() => {
    if (visibleFields.length > 0) {
      setWizardFields(computeWizardSequence(visibleFields))
    }
  }, [visibleFields, setWizardFields])
}
