import { getStorageItem } from '@/lib/storage'

import { openInNewTab, openOptionsPage } from './extension'

export async function openJiraIssue(ticket: string) {
  let jiraUrl = await getStorageItem('JiraHost').getValue()
  if (!jiraUrl) {
    openOptionsPage()
    return
  }

  if (jiraUrl.endsWith('/')) jiraUrl = jiraUrl.slice(0, -1)

  const ticketUrl = `${jiraUrl}/browse/${ticket.trim()}`
  openInNewTab(ticketUrl)
}
