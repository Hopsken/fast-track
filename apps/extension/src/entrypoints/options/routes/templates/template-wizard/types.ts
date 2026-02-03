import { JiraProject } from '@/repository/schema'
import type { JiraIssueType, JiraStatus } from '@/types/jira'
import type { AllowedValue, FieldMetadata } from '~/types/template'

export type WizardScope = {
  project?: JiraProject
  issueType?: JiraIssueType
}

/**
 * Base props shared by all field input components.
 */
export interface FieldInputBaseProps<T = unknown> {
  project: JiraProject
  issueType: JiraIssueType
  field: FieldMetadata
  value?: T
  onChange: (v?: T) => void
}

/**
 * Props for text input component.
 */
export interface TextInputProps extends FieldInputBaseProps<string> {
  placeholder?: string
}

/**
 * Props for textarea input component.
 */
export interface TextAreaInputProps extends FieldInputBaseProps<string> {
  placeholder?: string
  rows?: number
}

/**
 * Props for number input component.
 */
export interface NumberInputProps extends FieldInputBaseProps<number> {
  placeholder?: string
}

/**
 * Props for date input component (YYYY-MM-DD).
 */
export interface DateInputProps extends FieldInputBaseProps<string> {
  placeholder?: string
}

/**
 * Props for datetime input component (ISO 8601).
 */
export interface DateTimeInputProps extends FieldInputBaseProps<string> {
  placeholder?: string
}

/**
 * Props for generic JSON editor fallback.
 */
export interface GenericInputProps extends FieldInputBaseProps<unknown> {
  placeholder?: string
}

/**
 * Option with optional icon support (for visual entity fields).
 */
export interface IconOption {
  id: string
  name?: string
  value?: string
  iconUrl?: string
}

/**
 * Props for priority field input.
 */
export interface PriorityFieldInputProps
  extends FieldInputBaseProps<IconOption> {
  allowedValues: AllowedValue[]
}

/**
 * Props for issue type field input.
 */
export interface IssueTypeFieldInputProps
  extends FieldInputBaseProps<IconOption> {
  allowedValues: AllowedValue[]
}

/**
 * Props for project field input.
 */
export interface ProjectFieldInputProps
  extends FieldInputBaseProps<JiraProject> {
  allowedValues: AllowedValue[]
}

/**
 * Props for status field input.
 */
export interface StatusFieldInputProps extends FieldInputBaseProps<JiraStatus> {
  allowedValues: AllowedValue[]
}

/**
 * Props for resolution field input.
 */
export interface ResolutionFieldInputProps
  extends FieldInputBaseProps<IconOption> {
  allowedValues: AllowedValue[]
}

/**
 * Props for component field input (multi-select).
 */
export interface ComponentFieldInputProps
  extends FieldInputBaseProps<IconOption[]> {
  allowedValues: AllowedValue[]
}

/**
 * Props for version field input (multi-select).
 */
export interface VersionFieldInputProps
  extends FieldInputBaseProps<IconOption[]> {
  allowedValues: AllowedValue[]
}

/**
 * Props for group field input (multi-select).
 */
export interface GroupFieldInputProps
  extends FieldInputBaseProps<IconOption[]> {
  allowedValues: AllowedValue[]
}

/**
 * Props for time tracking input.
 */
export interface TimeTrackingInputProps
  extends FieldInputBaseProps<{
    originalEstimate?: string
    remainingEstimate?: string
  }> {
  allowedValues: AllowedValue[]
}

/**
 * Props for security level input.
 */
export interface SecurityLevelInputProps
  extends FieldInputBaseProps<IconOption> {
  allowedValues: AllowedValue[]
}

/**
 * Props for issue link input.
 */
export interface IssueLinkInputProps
  extends FieldInputBaseProps<{
    type: { id: string; name: string }
    outwardIssue?: { key: string }
  }> {
  allowedValues: AllowedValue[]
}

/**
 * Props for comma-separated input.
 */
export interface CommaSeparatedInputProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * Props for multi-select chips.
 */
export interface MultiSelectChipsProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for single select field.
 */
export interface SingleSelectFieldProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
  allowedValues: AllowedValue[]
  fieldName: string
}

/**
 * Props for user field input (with autocomplete).
 */
export interface UserFieldInputProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
  field: FieldMetadata
}

/**
 * Props for user ID input (manual entry).
 */
export interface UserIdInputProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
}
