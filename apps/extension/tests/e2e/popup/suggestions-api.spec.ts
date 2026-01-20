import { expect, test } from '../fixtures'

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

test.describe('Popup - Suggested tickets (API mocked via axios adapter)', () => {
  test('renders suggestions fetched from Jira API (mocked)', async ({
    context,
    extensionId
  }) => {
    // set credentials and ensure no persisted react-query cache short-circuits the fetch
    const setupPage = await context.newPage()
    await setupPage.goto(`chrome-extension://${extensionId}/options.html`)
    await setupPage.waitForLoadState('domcontentloaded')

    await setupPage.evaluate(async (credentials) => {
      await chrome.storage.local.set({ AuthCredentials: credentials })
      // clear persisted react-query cache key (if any)
      await chrome.storage.local.remove('REACT_QUERY_OFFLINE_CACHE')
    }, MOCK_AUTH_CREDENTIALS)

    await setupPage.close()

    const sw =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    sw.on('console', (msg) => {
      // eslint-disable-next-line no-console
      console.log('[e2e][sw] console', msg.type(), msg.text())
    })

    sw.on('pageerror', (err) => {
      // eslint-disable-next-line no-console
      console.error('[e2e][sw] pageerror', err)
    })

    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/popup.html`)
    await popup.waitForLoadState('domcontentloaded')

    // Sanity: should be in authenticated mode
    await expect(popup.getByText('Connect to Jira')).toHaveCount(0)

    // These values come from apps/extension/src/lib/jira/e2e/axios-mocks.ts
    await expect(popup.getByText('In progress ticket')).toBeVisible({
      timeout: 15_000
    })
    await expect(popup.getByText('PROJ-1')).toBeVisible()

    await expect(popup.getByText('Upcoming ticket')).toBeVisible()
    await expect(popup.getByText('PROJ-2')).toBeVisible()

    await expect(popup.getByText('Recently viewed ticket')).toBeVisible()
    await expect(popup.getByText('PROJ-9')).toBeVisible()

    await expect(
      popup.locator('[cmdk-group-heading]', { hasText: 'In Progress' })
    ).toBeVisible()
  })
})
