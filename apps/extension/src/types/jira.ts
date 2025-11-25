export interface JiraIssueType {
  name: string
  iconUrl: string
  description: string
}

export interface JiraStatusCategory {
  key: string
  colorName: string
  name: string
}

export interface JiraStatus {
  name: string
  description: string
  statusCategory: JiraStatusCategory
}

export interface JiraAssignee {
  displayName: string
  emailAddress: string
  avatarUrls: string
}

export interface JiraPriority {
  name: string
  iconUrl: string
}

export type IssueSource = 'history' | 'sprint' | 'sniff' | 'picker' | 'watching'

export interface JiraTicket {
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
