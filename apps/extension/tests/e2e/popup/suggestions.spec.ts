import { dehydrate, QueryClient } from '@tanstack/query-core'

import { expect, test } from '../fixtures'

import type { IssueSuggestion } from '@/services/ticket-service'

const MOCK_AUTH_CREDENTIALS = {
  type: 'apiKey' as const,
  host: 'https://test.atlassian.net',
  userInfo: {
    accountId: 'test-account-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  oauth: null,
  apiKey: {
    email: 'test@example.com',
    apiKey: 'test-api-key'
  }
}

function makeSuggestionFixtures(): IssueSuggestion {
  const makeTicket = (
    key: string,
    statusCategoryKey: 'indeterminate' | 'new' | 'done',
    summary: string
  ) => ({
    __typename: 'JiraTicket' as const,
    id: key,
    key,
    summary,
    issueType: {
      name: 'Task',
      iconUrl: '',
      description: ''
    },
    status: {
      id: `status-${statusCategoryKey}`,
      name:
        statusCategoryKey === 'indeterminate'
          ? 'In Progress'
          : statusCategoryKey === 'new'
            ? 'To Do'
            : 'Done',
      description: '',
      statusCategory: {
        key: statusCategoryKey,
        colorName: '',
        name: ''
      }
    },
    assignee: null,
    priority: null,
    projectKey: 'PROJ',
    boardName: 'Project',
    url: `https://test.atlassian.net/browse/${key}`,
    isInProgress: statusCategoryKey === 'indeterminate',
    sources: [],
    lastViewed: null,
    created: '2024-01-01',
    updated: '2024-02-01'
  })

  const t1 = makeTicket('PROJ-1', 'indeterminate', 'In progress ticket')
  const t2 = makeTicket('PROJ-2', 'new', 'Upcoming ticket')
  const t3 = makeTicket('PROJ-9', 'done', 'Recently viewed ticket')

  return {
    tickets: {
      [t1.key]: t1,
      [t2.key]: t2,
      [t3.key]: t3
    },
    inProgress: [t1.key],
    todo: [t2.key],
    done: [],
    recommend: [t3.key]
  }
}

test.describe('Popup - Suggested tickets', () => {
  test('renders suggested tickets in the popup', async ({
    context,
    extensionId
  }) => {
    const serviceWorker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    // Set up auth + seed React Query offline cache so the popup can render
    // suggestions deterministically without hitting the real Jira network.
    const manifestVersion = await serviceWorker.evaluate(() => {
      return chrome.runtime.getManifest().version
    })

    const buster = `production-${manifestVersion}`
    const suggestions = makeSuggestionFixtures()

    const queryClient = new QueryClient()
    queryClient.setQueryData(['tickets', 'suggestions'], suggestions)

    const persistedClient = {
      timestamp: Date.now(),
      buster,
      clientState: dehydrate(queryClient)
    }

    await serviceWorker.evaluate(
      async ({ credentials, persisted }) => {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set(
            {
              AuthCredentials: credentials,
              // createAsyncStoragePersister default key
              REACT_QUERY_OFFLINE_CACHE: JSON.stringify(persisted)
            },
            () => resolve()
          )
        })
      },
      { credentials: MOCK_AUTH_CREDENTIALS, persisted: persistedClient }
    )

    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/popup.html`)
    await popup.waitForLoadState('domcontentloaded')

    // Ticket items
    await expect(popup.getByText('In progress ticket')).toBeVisible({
      timeout: 15_000
    })
    await expect(popup.getByText('PROJ-1')).toBeVisible()

    await expect(popup.getByText('Upcoming ticket')).toBeVisible()
    await expect(popup.getByText('PROJ-2')).toBeVisible()

    await expect(popup.getByText('Recently viewed ticket')).toBeVisible()
    await expect(popup.getByText('PROJ-9')).toBeVisible()

    // Group headings should be present as well
    await expect(
      popup.locator('[cmdk-group-heading]', { hasText: 'In Progress' })
    ).toBeVisible()

    await expect(
      popup.locator('[cmdk-group-heading]', { hasText: 'Upcoming' })
    ).toBeVisible()

    await expect(
      popup.locator('[cmdk-group-heading]', { hasText: 'Recommend for you' })
    ).toBeVisible()
  })
})
