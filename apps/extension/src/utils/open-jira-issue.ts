import { getStorageItem } from '@/lib/storage'

import { openInNewTab, openOptionsPage } from './extension'

const getJiraHost = async () => {
  const credentials = await getStorageItem('AuthCredentials').getValue()
  if (!credentials?.host) {
    openOptionsPage()
    return null
  }

  const host = credentials.host
  return host.endsWith('/') ? host.slice(0, -1) : host
}

export async function openJiraIssue(ticket: string) {
  const jiraHost = await getJiraHost()
  if (!jiraHost) return

  const ticketUrl = `${jiraHost}/browse/${ticket.trim()}`
  openInNewTab(ticketUrl)
}

export async function openJiraSearch(query: string) {
  const jiraHost = await getJiraHost()
  if (!jiraHost) return

  const jql = encodeURIComponent(`text ~ "${query.trim()}"`)
  openInNewTab(`${jiraHost}/issues/?jql=${jql}`)
}
