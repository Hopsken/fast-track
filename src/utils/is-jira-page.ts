export const isJiraWebPage = (document: Document) => {
  return !!document.getElementById("jira")
}

export const getKanbanBoard = (document: Document) => {
  return document.getElementById("gh")
}

export const getJiraApp = (document: Document) => {
  if (!isJiraWebPage(document)) return null
  return (
    document.getElementById("jira-frontend") || document.getElementById("page")
  )
}

const pattern = /^https:\/\/.*\.atlassian\.net\/jira\/.*$/
export const isJiraCloud = (href: string) => {
  return pattern.test(href)
}
