import type { JiraIssueType, JiraProject } from '@/types/jira'

export type CreateIssueScope = {
  project: JiraProject
  issueType: JiraIssueType
}
