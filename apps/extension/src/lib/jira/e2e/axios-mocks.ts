import type { AxiosAdapter, AxiosResponse } from 'axios'

/**
 * Create an axios adapter that returns mocked responses for Jira REST calls.
 *
 * Important:
 * - jira.js uses its own axios instance (axios.create())
 * - Patching global axios or global fetch is not reliable under pnpm + bundling
 * - The most reliable seam is providing `baseRequestConfig.adapter` to jira.js
 */
export function createJiraE2EMockAdapter(): AxiosAdapter {
  const json = (
    config: Parameters<AxiosAdapter>[0],
    status: number,
    data: unknown
  ): AxiosResponse => ({
    status,
    statusText: String(status),
    data,
    headers: { 'content-type': 'application/json' },
    config,
    request: {}
  })

  const getStatusName = (
    statusCategoryKey: 'indeterminate' | 'new' | 'done'
  ): string => {
    switch (statusCategoryKey) {
      case 'indeterminate':
        return 'In Progress'
      case 'new':
        return 'To Do'
      case 'done':
        return 'Done'
    }
  }

  const makeIssue = (params: {
    host: string
    key: string
    summary: string
    statusCategoryKey: 'indeterminate' | 'new' | 'done'
  }) => {
    const { host, key, summary, statusCategoryKey } = params
    const id = key.replace(/\D/g, '') || key

    const statusName = getStatusName(statusCategoryKey)

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

  // eslint-disable-next-line sonarjs/cognitive-complexity
  return async (config) => {
    const method = (config.method ?? 'get').toLowerCase()

    let url: URL
    try {
      url = new URL(config.url ?? '', config.baseURL)
    } catch {
      return json(config, 500, { message: 'Invalid URL in axios config' })
    }

    const host = url.origin

    // --- Search ---
    if (method === 'post' && url.pathname.startsWith('/rest/api/3/search')) {
      let body: { jql?: string } | undefined
      if (typeof config.data === 'string') {
        try {
          body = JSON.parse(config.data) as { jql?: string }
        } catch {
          return json(config, 400, {
            message: 'Invalid JSON body for Jira search mock',
            url: url.toString()
          })
        }
      } else {
        body = config.data as { jql?: string } | undefined
      }

      const jql = body?.jql ?? ''

      // TicketService.getIssueSuggestions() calls:
      // 1) statusCategory = "In Progress"
      // 2) sprint in openSprints()
      // 3) issue in issueHistory()
      if (jql.includes('statusCategory = "In Progress"')) {
        return json(config, 200, {
          issues: [
            makeIssue({
              host,
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
        return json(config, 200, {
          issues: [
            makeIssue({
              host,
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
        return json(config, 200, {
          issues: [
            makeIssue({
              host,
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

      return json(config, 501, {
        message: `No e2e Jira mock for search jql: ${jql}`,
        url: url.toString()
      })
    }

    // --- Create meta (create issue fields metadata) ---
    // Used by Create Issue Hub / template wizard.
    // jira.js: GET /rest/api/3/issue/createmeta/{projectIdOrKey}/issuetypes/{issueTypeId}
    if (
      method === 'get' &&
      /^\/rest\/api\/3\/issue\/createmeta\/[^/]+\/issuetypes\/[^/]+$/.test(
        url.pathname
      )
    ) {
      return json(config, 200, {
        startAt: 0,
        maxResults: 50,
        total: 2,
        fields: [
          {
            fieldId: 'summary',
            key: 'summary',
            name: 'Summary',
            required: true,
            hasDefaultValue: false,
            schema: {
              type: 'string',
              system: 'summary'
            },
            operations: ['set']
          },
          {
            fieldId: 'description',
            key: 'description',
            name: 'Description',
            required: false,
            hasDefaultValue: false,
            schema: {
              type: 'string',
              system: 'description'
            },
            operations: ['set']
          }
        ]
      })
    }

    // --- Myself ---
    if (method === 'get' && url.pathname === '/rest/api/3/myself') {
      return json(config, 200, {
        accountId: 'test-account-id',
        displayName: 'Test User',
        emailAddress: 'test@example.com',
        avatarUrls: { '16x16': '' }
      })
    }

    return json(config, 501, {
      message: `No e2e Jira mock for ${method.toUpperCase()} ${url.pathname}`,
      url: url.toString()
    })
  }
}
