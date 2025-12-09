import { getStorageItem } from '@/lib/storage'

import { openInNewTab, openOptionsPage } from './extension'

const normalizeJiraHost = async () => {
  const jiraHost = await getStorageItem('JiraHost').getValue()
  if (!jiraHost) {
    openOptionsPage()
    return null
  }

  return jiraHost.endsWith('/') ? jiraHost.slice(0, -1) : jiraHost
}

export async function openJiraIssue(ticket: string) {
  const jiraHost = await normalizeJiraHost()
  if (!jiraHost) return

  const ticketUrl = `${jiraHost}/browse/${ticket.trim()}`
  openInNewTab(ticketUrl)
}

export async function openJiraSearch(query: string) {
  const jiraHost = await normalizeJiraHost()
  if (!jiraHost) return

  const jql = encodeURIComponent(`text ~ "${query.trim()}"`)
  openInNewTab(`${jiraHost}/issues/?jql=${jql}`)
}
