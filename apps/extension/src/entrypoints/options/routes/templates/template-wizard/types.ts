import type { JiraIssueType, JiraProject } from '@/types/jira'
import type { AllowedValue, FieldMetadata } from '~/types/template'

export type WizardScope = {
  project?: JiraProject
  issueType?: JiraIssueType
}

/**
 * Base props shared by all field input components.
 */
export interface FieldInputBaseProps {
  field?: FieldMetadata
}

/**
 * Props for text input component.
 */
export interface TextInputProps extends FieldInputBaseProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
  placeholder?: string
}

/**
 * Props for textarea input component.
 */
export interface TextAreaInputProps extends FieldInputBaseProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
  placeholder?: string
  rows?: number
}

/**
 * Props for number input component.
 */
export interface NumberInputProps extends FieldInputBaseProps {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
}

/**
 * Props for date input component (YYYY-MM-DD).
 */
export interface DateInputProps extends FieldInputBaseProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
}

/**
 * Props for datetime input component (ISO 8601).
 */
export interface DateTimeInputProps extends FieldInputBaseProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
}

/**
 * Props for generic JSON editor fallback.
 */
export interface GenericInputProps extends FieldInputBaseProps {
  value: unknown
  onChange: (v: unknown) => void
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
export interface PriorityFieldInputProps extends FieldInputBaseProps {
  value: IconOption | undefined
  onChange: (v: IconOption | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for issue type field input.
 */
export interface IssueTypeFieldInputProps extends FieldInputBaseProps {
  value: IconOption | undefined
  onChange: (v: IconOption | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for project field input.
 */
export interface ProjectFieldInputProps extends FieldInputBaseProps {
  value:
    | { id: string; key: string; name: string; avatarUrl?: string }
    | undefined
  onChange: (
    v: { id: string; key: string; name: string; avatarUrl?: string } | undefined
  ) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for status field input.
 */
export interface StatusFieldInputProps extends FieldInputBaseProps {
  value: { id: string; name: string; statusCategory?: string } | undefined
  onChange: (
    v: { id: string; name: string; statusCategory?: string } | undefined
  ) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for resolution field input.
 */
export interface ResolutionFieldInputProps extends FieldInputBaseProps {
  value: IconOption | undefined
  onChange: (v: IconOption | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for component field input (multi-select).
 */
export interface ComponentFieldInputProps extends FieldInputBaseProps {
  value: IconOption[] | undefined
  onChange: (v: IconOption[] | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for version field input (multi-select).
 */
export interface VersionFieldInputProps extends FieldInputBaseProps {
  value: IconOption[] | undefined
  onChange: (v: IconOption[] | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for group field input (multi-select).
 */
export interface GroupFieldInputProps extends FieldInputBaseProps {
  value: IconOption[] | undefined
  onChange: (v: IconOption[] | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for time tracking input.
 */
export interface TimeTrackingInputProps extends FieldInputBaseProps {
  value:
    | {
        originalEstimate?: string
        remainingEstimate?: string
      }
    | undefined
  onChange: (
    v:
      | {
          originalEstimate?: string
          remainingEstimate?: string
        }
      | undefined
  ) => void
}

/**
 * Props for security level input.
 */
export interface SecurityLevelInputProps extends FieldInputBaseProps {
  value: IconOption | undefined
  onChange: (v: IconOption | undefined) => void
  allowedValues: AllowedValue[]
}

/**
 * Props for issue link input.
 */
export interface IssueLinkInputProps extends FieldInputBaseProps {
  value:
    | {
        type: { id: string; name: string }
        outwardIssue?: { key: string }
      }
    | undefined
  onChange: (
    v:
      | {
          type: { id: string; name: string }
          outwardIssue?: { key: string }
        }
      | undefined
  ) => void
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
