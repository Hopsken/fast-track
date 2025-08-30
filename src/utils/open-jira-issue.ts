import { StorageKey, persistLayer } from '~/storage'

import { openInNewTab, openOptionsPage } from './extension'

function containsOnlyNumbers(str: string) {
  return /^\d+$/.test(str)
}

export async function openJiraIssue(ticket: string) {
  let jiraUrl = await persistLayer.get(StorageKey.JiraUrl)

  if (!jiraUrl) {
    openOptionsPage()
    return
  }

  if (jiraUrl.endsWith('/')) jiraUrl = jiraUrl.slice(0, -1)
  if (containsOnlyNumbers(ticket)) {
    let issuePrefix = await persistLayer.get(StorageKey.PrimaryIssueKeyPrefix)
    if (issuePrefix) {
      ticket = `${issuePrefix.trim().replace(/-/g, '')}-${ticket}`
    }
  }

  const ticketUrl = `${jiraUrl}/browse/${ticket.trim()}`
  openInNewTab(ticketUrl)
}
