/**
 * Utility functions for Jira URL handling
 */

/**
 * Extracts Jira URL from the current page
 */
export function extractJiraUrlFromCurrentPage(): string {
  const { hostname } = window.location
  if (hostname.includes('atlassian.net')) {
    return `https://${hostname}`
  }
  return ''
}

/**
 * Validates if a URL is a valid Jira URL
 */
export function isValidJiraUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname.includes('atlassian.net') ||
      urlObj.pathname.includes('/jira')
    )
  } catch {
    return false
  }
}

/**
 * Normalizes a Jira URL by ensuring proper protocol and format
 */
export function normalizeJiraUrl(url: string): string {
  if (!url) return ''

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    const urlObj = new URL(url)
    return urlObj.origin
  } catch {
    return url
  }
}

/**
 * Extracts the Jira instance name from a URL
 */
export function extractJiraInstanceName(url: string): string {
  try {
    const urlObj = new URL(url)
    const { hostname } = urlObj

    if (hostname.includes('atlassian.net')) {
      return hostname.split('.atlassian.net')[0]
    }

    return hostname
  } catch {
    return ''
  }
}

/**
 * Builds a Jira issue URL
 */
export function buildIssueUrl(baseUrl: string, issueKey: string): string {
  const normalizedBaseUrl = normalizeJiraUrl(baseUrl)
  return `${normalizedBaseUrl}/browse/${issueKey}`
}

/**
 * Extracts issue key from a Jira URL
 */
export function extractIssueKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const match = urlObj.pathname.match(/\/browse\/([A-Z]+-\d+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Checks if a URL points to a Jira issue
 */
export function isJiraIssueUrl(url: string): boolean {
  return extractIssueKeyFromUrl(url) !== null
}

/**
 * Builds various Jira URLs
 */
export const JiraUrlBuilder = {
  issue: (baseUrl: string, key: string) => buildIssueUrl(baseUrl, key),
  board: (baseUrl: string, boardId: number) =>
    `${normalizeJiraUrl(baseUrl)}/secure/RapidBoard.jspa?rapidView=${boardId}`,
  project: (baseUrl: string, projectKey: string) =>
    `${normalizeJiraUrl(baseUrl)}/projects/${projectKey}`,
  search: (baseUrl: string, jql: string) =>
    `${normalizeJiraUrl(baseUrl)}/issues/?jql=${encodeURIComponent(jql)}`
} as const
