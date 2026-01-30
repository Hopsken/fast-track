import type { JiraIssueType, JiraProject } from '@/types/jira'

export type WizardScope = {
  project?: JiraProject
  issueType?: JiraIssueType
}
