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
    const sw =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    // Set credentials and ensure no persisted react-query cache short-circuits the fetch.
    // Do this from the MV3 background service worker to avoid UI-side storage races.
    await sw.evaluate(async (credentials) => {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ AuthCredentials: credentials }, () => resolve())
      })

      await new Promise<void>((resolve) => {
        chrome.storage.local.remove('REACT_QUERY_OFFLINE_CACHE', () => resolve())
      })
    }, MOCK_AUTH_CREDENTIALS)

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
