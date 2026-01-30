import type { SearchOption } from '@/components/ui'
import type { JiraProject } from '@/types/jira'

export type WizardScope = {
  projectKey: string
  projectName: string
  issueTypeId: string
  issueTypeName: string
}

export type ProjectOption = Pick<JiraProject, 'key' | 'name' | 'issueTypes'>
export type IssueTypeOption = { id: string; name: string; subtask?: boolean }

export type Step = 1 | 2

export function toProjectSearchOption(
  project: ProjectOption
): SearchOption<ProjectOption> {
  return {
    value: project.key,
    label: `${project.key} — ${project.name}`,
    data: project
  }
}

export function toIssueTypeSearchOption(
  issueType: IssueTypeOption
): SearchOption<IssueTypeOption> {
  return {
    value: issueType.id,
    label: issueType.name,
    data: issueType
  }
}
