/**
 * Utilities for detecting and working with Jira pages
 */

/**
 * Checks if the current document is a Jira web page
 */
export function isJiraWebPage(document: Document): boolean {
  const { hostname } = document.location
  const { pathname } = document.location

  return hostname.includes('atlassian.net') && pathname.includes('/jira')
}

/**
 * Gets the Jira application container element
 */
export function getJiraApp(document: Document): Element | null {
  return (
    document.getElementById('jira') ||
    document.querySelector('[data-testid="jira-app"]') ||
    document.querySelector('#app')
  )
}

/**
 * Gets the Kanban board container element
 */
export function getKanbanBoard(document: Document): Element | null {
  return (
    document.getElementById('gh') ||
    document.querySelector('[data-testid="board.layout"]') ||
    document.querySelector('.ghx-board-wrap')
  )
}

/**
 * Detects the current Jira page type
 */
export function getJiraPageType(document: Document): JiraPageType {
  const { pathname } = document.location
  const { search } = document.location

  if (pathname.includes('/browse/')) {
    return 'issue-detail'
  }

  if (
    pathname.includes('/boards/') ||
    pathname.includes('/secure/RapidBoard.jspa')
  ) {
    return 'board'
  }

  if (pathname.includes('/issues/') || search.includes('filter=')) {
    return 'search-results'
  }

  if (pathname.includes('/projects/')) {
    return 'project'
  }

  return 'unknown'
}

/**
 * Jira page types
 */
export type JiraPageType =
  | 'issue-detail'
  | 'board'
  | 'search-results'
  | 'project'
  | 'unknown'

/**
 * Waits for a specific Jira element to appear
 */
export function waitForJiraElement(
  selector: string,
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}
