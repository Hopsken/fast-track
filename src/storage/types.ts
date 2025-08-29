/**
 * Storage-related type definitions
 */

export interface JiraTicket {
  id: string
  key: string
  summary: string
  status: string
  assignee?: string
  priority?: string
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
  license_key: {
    key: string
  }
  instance: {
    id: string
    name: string
  }
  meta: {
    customer_email: string
  }
}

export type DarkModeOption = "always" | "auto" | "disable"

export interface JiraApiConfig {
  host: string
  email: string
  token: string
}