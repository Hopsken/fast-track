import { JiraIssueType, JiraProject } from '@/repository/schema'
import type { VisibleField } from '~/services/template-service/gap-analysis'

/**
 * Standard props interface for all field input components.
 * Each field component receives the field metadata, current value, and confirmation handler.
 */
export interface FieldInputProps<T = unknown> {
  project: JiraProject
  issueType: JiraIssueType
  field: VisibleField
  currentValue: T
  onChange: (value: T) => void
  onConfirm: () => void
}
