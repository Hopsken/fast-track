/**
 * Storage-related type definitions
 */
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

export interface JiraTicket {
  id: string
  key: string
  summary: string
  issueType: JiraIssueType
  status: JiraStatus
  assignee?: JiraAssignee
  priority?: JiraPriority
  projectKey: string
  boardName?: string
  url: string
  lastViewed: string
  viewCount: number
}

export interface TicketViewRecord {
  ticketKey: string
  viewCount: number
  lastViewed: string
}

export interface CustomBackground {
  id: string
  url: string
  thumb_url: string
  instance_id: string
}

export interface LicenseInfo {
  valid: boolean
  lastChecked: string
  instance: {
    id: string
    name: string
  }
  license_key: {
    key: string
    status: string
    activation_usage: number
    activation_limit: number
  }
  meta: {
    customer_email: string
    product_id: number
    store_id: number
  }
}

export type DarkModeOption = 'always' | 'auto' | 'disable'
