import type {
  AllowedValue,
  CachedFieldMetadata,
  FieldConflict,
  FieldMetadata,
  IssueTemplate,
  JsonType
} from '~/types/template'

export interface RefreshResult {
  conflicts: FieldConflict[]
  updatedCache: CachedFieldMetadata | null
}

export interface JiraServiceLike {
  getCreateIssueFields(input: {
    projectIdOrKey: string
    issueTypeId: string
  }): Promise<FieldMetadata[]>
}

export async function refreshAndDetectConflicts(
  template: IssueTemplate,
  jiraService: JiraServiceLike
): Promise<RefreshResult> {
  const { projectKey, issueTypeId, siteUrl } = template.scope
  const conflicts: FieldConflict[] = []

  let freshFields: FieldMetadata[]
  try {
    freshFields = await jiraService.getCreateIssueFields({
      projectIdOrKey: projectKey,
      issueTypeId
    })
  } catch (error: any) {
    if (error?.status === 404) {
      conflicts.push({
        fieldId: '_scope',
        fieldName: 'Template Scope',
        type: 'scope_invalid',
        message: `Project ${projectKey} or issue type no longer exists`
      })
      return { conflicts, updatedCache: null }
    }
    throw error
  }

  // Guard: avoid overwriting cache with empty/invalid data. If Jira returns no fields,
  // keep existing cache and only return scope-related conflicts if any were detected.
  if (!Array.isArray(freshFields) || freshFields.length === 0) {
    return { conflicts, updatedCache: null }
  }

  const freshFieldMap = new Map(freshFields.map((f) => [f.fieldId, f]))

  // 1) Check configured fields
  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (fieldId === 'project' || fieldId === 'issuetype') continue

    const freshField = freshFieldMap.get(fieldId)

    if (!freshField) {
      if (config.behavior !== 'ignore') {
        conflicts.push({
          fieldId,
          fieldName: fieldId,
          type: 'field_removed',
          message: 'Field no longer exists in Jira'
        })
      }
      continue
    }

    if (config.behavior === 'preset' && config.presetValue !== undefined) {
      const isValid = validatePresetValue(
        config.presetValue,
        freshField.allowedValues,
        freshField.schema
      )
      if (!isValid) {
        conflicts.push({
          fieldId,
          fieldName: freshField.name,
          type: 'preset_invalid',
          message: 'Preset value is no longer available',
          fieldMetadata: freshField
        })
      }
    }
  }

  // 2) Check new required fields
  for (const freshField of freshFields) {
    if (!freshField.required) continue
    if (freshField.fieldId === 'summary') continue
    if (freshField.fieldId === 'project' || freshField.fieldId === 'issuetype')
      continue

    const config = template.fields[freshField.fieldId]
    if (!config || config.behavior === 'ignore') {
      conflicts.push({
        fieldId: freshField.fieldId,
        fieldName: freshField.name,
        type: 'now_required',
        message: 'This field is now required',
        fieldMetadata: freshField
      })
    }
  }

  const cacheKey = `${siteUrl}:${projectKey}:${issueTypeId}`
  const updatedCache: CachedFieldMetadata = {
    cacheKey,
    lastUpdated: new Date().toISOString(),
    fields: freshFields
  }

  return { conflicts, updatedCache }
}

export function validatePresetValue(
  presetValue: unknown,
  allowedValues: AllowedValue[] | undefined,
  schema: JsonType
): boolean {
  if (!allowedValues || allowedValues.length === 0) return true

  if (schema.type === 'option' || schema.type === 'priority') {
    const valueId = (presetValue as { id?: string } | null)?.id
    if (!valueId) return false
    return allowedValues.some((av) => av.id === valueId)
  }

  if (schema.type === 'array' && Array.isArray(presetValue)) {
    return presetValue.every((item) => {
      const itemId = (item as { id?: string } | null)?.id
      if (!itemId) return false
      return allowedValues.some((av) => av.id === itemId)
    })
  }

  if (schema.type === 'user') return true

  return true
}
