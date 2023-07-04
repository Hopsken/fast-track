import { StorageKey, persistLayer } from "~storage"

import { openInNewTab, openOptionsPage } from "./broswer"

export async function openJiraIssue(ticket: string) {
  const jiraUrl = await persistLayer.get(StorageKey.JiraUrl)

  if (!jiraUrl) {
    openOptionsPage()
    return
  }

  const ticketUrl = jiraUrl + ticket.trim()
  openInNewTab(ticketUrl)
}
