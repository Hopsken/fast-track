export const isJiraWebPage = (document: Document) => {
  return !!document.getElementById("jira")
}

export const getKanbanBoard = (document: Document) => {
  return document.getElementById("gh")
}

const pattern = /^https:\/\/.*\.atlassian\.net\/jira\/.*$/
export const isJiraCloud = (href: string) => {
  return pattern.test(href)
}
