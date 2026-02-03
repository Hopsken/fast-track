import type {
  JiraIssueType,
  JiraProject as JiraProjectCore
} from '~/repository/schema'

export type { JiraIssueType }

export interface JiraStatusCategory {
  key: string
  colorName: string
  name: string
}

export interface JiraStatus {
  id: string
  name: string
  description: string
  statusCategory: JiraStatusCategory
}

export interface JiraTransition {
  id: string
  name: string
  to: JiraStatus
}

export interface JiraAssignee {
  displayName: string
  emailAddress: string
  avatarUrls: string | Record<string, string>
}

export interface JiraPriority {
  id?: string
  name: string
  iconUrl: string
}

export interface JiraMergeRequest {
  id: string
  title: string
  url: string
  provider: 'github' | 'gitlab'
}

// ─────────────────────────────────────────────────────────────────────────
// Projects (minimal shape used by the extension)
// ─────────────────────────────────────────────────────────────────────────

export interface JiraProject extends JiraProjectCore {
  issueTypes?: JiraIssueType[]
}

export type IssueSource = 'history' | 'sprint' | 'sniff' | 'picker' | 'watching'

export interface JiraTicket {
  __typename: 'JiraTicket'
  id: string
  key: string
  summary: string
  issueType: JiraIssueType
  status: JiraStatus
  assignee: JiraAssignee | null
  priority: JiraPriority | null
  projectKey: string
  boardName: string
  url: string
  isInProgress: boolean
  sources: IssueSource[]

  lastViewed: string | null
  created: string
  updated: string
}

export interface IssueDetail extends JiraTicket {
  description?: string
  reporter?: JiraAssignee
  labels?: string[]
  components?: Array<{ id: string; name: string }>
  parent?: {
    key: string
    summary: string
  }
  subtasks?: Array<{
    id: string
    key: string
    summary: string
    fields: {
      status: { name: string }
      priority: { name: string; iconUrl?: string }
      issuetype: { iconUrl?: string }
    }
  }>
  dueDate?: string
  // Extra project info not in JiraTicket
  project?: {
    key: string
    name: string
    avatarUrl?: string
  }
}

export interface CreateIssuePayload {
  projectKey: string
  issueTypeId: string
  fields: CreateIssueFields
}

export interface CreateIssueFields extends Record<string, unknown> {
  summary: string
}
