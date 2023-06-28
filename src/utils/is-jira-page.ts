export const isJiraWebPage = (document: Document) => {
  return !!document.getElementById("jira-frontend")
}
