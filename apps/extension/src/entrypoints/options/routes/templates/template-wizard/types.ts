import type { JiraIssueType, JiraProject } from '@/types/jira'

export type WizardScope = {
  project?: JiraProject
  issueType?: JiraIssueType
}

export type Step = 1 | 2 | 3
