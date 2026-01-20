import type { BrowserContext } from '@playwright/test'

export type InstallJiraMocksOptions = {
  /**
   * Jira host used by apiKey auth (AuthCredentials.host)
   *
   * Default: https://test.atlassian.net
   */
  host?: string

  /** Log intercepted requests to the Playwright runner output */
  debug?: boolean
}

/**
 * Install Jira API mocks for MV3 background-service-worker traffic.
 *
 * Why this approach:
 * - In MV3, most requests originate from the extension background *service worker*.
 * - Playwright's context.route() does not reliably intercept extension SW traffic.
 * - Patching fetch inside the background SW is deterministic and works in headless.
 */
export async function installJiraMocks(
  context: BrowserContext,
  options?: InstallJiraMocksOptions
) {
  const host = options?.host ?? 'https://test.atlassian.net'
  const debug = options?.debug ?? false

  const serviceWorker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

  await serviceWorker.evaluate(
    async ({ host, debug }) => {
      const g = globalThis as unknown as {
        __JIRA_BOOST_E2E_MOCKS__?: {
          installed?: boolean
          originalFetch?: typeof fetch
        }
      }

      g.__JIRA_BOOST_E2E_MOCKS__ ??= {}
      if (g.__JIRA_BOOST_E2E_MOCKS__.installed) return

      const originalFetch = globalThis.fetch.bind(globalThis)
      g.__JIRA_BOOST_E2E_MOCKS__.installed = true
      g.__JIRA_BOOST_E2E_MOCKS__.originalFetch = originalFetch

      const jsonResponse = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), {
          status,
          headers: {
            'content-type': 'application/json'
          }
        })

      const makeIssue = (params: {
        key: string
        summary: string
        statusCategoryKey: 'indeterminate' | 'new' | 'done'
      }) => {
        const { key, summary, statusCategoryKey } = params
        const id = key.replace(/[^0-9]/g, '') || key
        const statusName =
          statusCategoryKey === 'indeterminate'
            ? 'In Progress'
            : statusCategoryKey === 'new'
              ? 'To Do'
              : 'Done'

        return {
          id,
          key,
          self: `${host}/rest/api/3/issue/${id}`,
          fields: {
            summary,
            issuetype: {
              name: 'Task',
              iconUrl: '',
              description: ''
            },
            status: {
              id: `status-${statusCategoryKey}`,
              name: statusName,
              description: '',
              statusCategory: {
                key: statusCategoryKey,
                colorName: '',
                name: statusName
              }
            },
            assignee: null,
            priority: {
              id: '2',
              name: 'High',
              iconUrl: ''
            },
            project: {
              key: key.split('-')[0] ?? 'PROJ',
              name: 'Project'
            },
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-02-01T00:00:00.000Z',
            lastViewed: null
          }
        }
      }

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const req = new Request(input, init)
        const url = new URL(req.url)

        const isJiraHost = url.origin === host
        const isJiraV3 = url.pathname.startsWith('/rest/api/3/')

        if (!isJiraHost || !isJiraV3) {
          return originalFetch(input, init)
        }

        if (debug) {
          // eslint-disable-next-line no-console
          console.log('[e2e][jira-mock][sw] request', req.method, req.url)
        }

        // jira.js search endpoints vary by version; handle common forms
        const isSearch =
          req.method === 'POST' && url.pathname.startsWith('/rest/api/3/search')

        if (isSearch) {
          let jql = ''
          try {
            const body = (await req.clone().json()) as { jql?: string } | null
            jql = body?.jql ?? ''
          } catch {
            // ignore
          }

          if (debug) {
            // eslint-disable-next-line no-console
            console.log('[e2e][jira-mock][sw] jql', jql)
          }

          // TicketService.getIssueSuggestions() calls:
          // 1) statusCategory = "In Progress"
          // 2) sprint in openSprints()
          // 3) issue in issueHistory()
          if (jql.includes('statusCategory = "In Progress"')) {
            return jsonResponse({
              issues: [
                makeIssue({
                  key: 'PROJ-1',
                  summary: 'In progress ticket',
                  statusCategoryKey: 'indeterminate'
                })
              ],
              startAt: 0,
              maxResults: 50,
              total: 1
            })
          }

          if (jql.includes('sprint in openSprints()')) {
            return jsonResponse({
              issues: [
                makeIssue({
                  key: 'PROJ-2',
                  summary: 'Upcoming ticket',
                  statusCategoryKey: 'new'
                })
              ],
              startAt: 0,
              maxResults: 50,
              total: 1
            })
          }

          if (jql.includes('issue in issueHistory()')) {
            return jsonResponse({
              issues: [
                makeIssue({
                  key: 'PROJ-9',
                  summary: 'Recently viewed ticket',
                  statusCategoryKey: 'done'
                })
              ],
              startAt: 0,
              maxResults: 50,
              total: 1
            })
          }

          return jsonResponse(
            {
              message: `No Jira search mock for jql: ${jql}`,
              url: req.url
            },
            501
          )
        }

        return jsonResponse(
          {
            message: `No Jira REST mock for ${req.method} ${url.pathname}`,
            url: req.url
          },
          501
        )
      }
    },
    { host, debug }
  )
}
