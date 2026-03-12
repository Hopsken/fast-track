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

test.describe('Popup - Create issue hub', () => {
  test('edits summary in hub without filtering fields; ESC cancels; drill-in description and Done returns to hub', async ({
    context,
    extensionId
  }) => {
    const serviceWorker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    const now = new Date().toISOString()

    await serviceWorker.evaluate(
      async ({ credentials, templates }) => {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set(
            {
              AuthCredentials: credentials,
              IssueTemplates: templates
            },
            () => resolve()
          )
        })
      },
      {
        credentials: MOCK_AUTH_CREDENTIALS,
        templates: [
          {
            id: 'tpl-smoke',
            name: 'Smoke Template',
            description: 'Used in Playwright e2e',
            scope: {
              baseUrlHost: 'test.atlassian.net',
              project: {
                id: '10000',
                key: 'PROJ',
                name: 'Project'
              },
              issueType: {
                id: '10001',
                name: 'Task',
                iconUrl: '',
                description: ''
              }
            },
            fields: [
              {
                fieldId: 'description',
                behavior: 'preset',
                presetValue: 'Description'
              }
            ],
            createdAt: now,
            updatedAt: now
          }
        ]
      }
    )

    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/popup.html`)
    await popup.waitForLoadState('domcontentloaded')

    const input = popup.locator('[data-slot="command-input"]')
    await expect(input).toBeVisible({ timeout: 15_000 })

    // Enter template menu (MainMenu rule: + / c / C)
    // Use "c" so filtering still matches the template action keywords ("create").
    await input.fill('c')

    // Wait for template list to render
    await expect(popup.getByText('Smoke Template')).toBeVisible({
      timeout: 15_000
    })
    await popup.getByText('Smoke Template').click()

    // Hub summary input
    const summaryInput = popup.locator('[data-slot="command-input"]')
    await expect(summaryInput).toBeVisible({ timeout: 15_000 })

    // Description should be listed (summary is edited in hub; should not filter list)
    await expect(popup.getByText('Description')).toBeVisible()

    await summaryInput.fill('Hello world')
    await expect(summaryInput).toHaveValue('Hello world')

    // shouldFilter=false: typing summary should not hide fields
    await expect(popup.getByText('Description')).toBeVisible()

    // Progress should count summary + description
    await expect(
      popup.getByRole('progressbar', {
        name: 'Wizard progress: 1 of 2 fields completed'
      })
    ).toBeVisible()

    // ESC should cancel (go back), not clear summary
    await summaryInput.press('Escape')

    // Back to template list (ESC pops CreateIssueMenu, returns to IssueTemplatesMenu).
    // This ensures ESC did *not* just clear the summary input in-place.
    const mainInputAfterCancel = popup.locator('[data-slot="command-input"]')
    await expect(mainInputAfterCancel).toBeVisible({ timeout: 15_000 })
    await expect(popup.getByText('Smoke Template')).toBeVisible({
      timeout: 15_000
    })

    // Re-enter template menu
    await mainInputAfterCancel.fill('c')
    await expect(popup.getByText('Smoke Template')).toBeVisible({
      timeout: 15_000
    })
    await popup.getByText('Smoke Template').click()

    await expect(summaryInput).toBeVisible({ timeout: 15_000 })
    await summaryInput.fill('Hello world')

    // Drill into description
    // Use cmdk item value to avoid strict-mode collisions (the row can render
    // "Description" in both primary + secondary lines when a preset exists).
    await popup
      .locator('[cmdk-item][data-value^="field:description"]')
      .click()

    const textarea = popup.locator('textarea')
    await expect(textarea).toBeVisible({ timeout: 15_000 })
    await textarea.fill('Some details')

    await popup.getByRole('button', { name: 'Done' }).click()

    // Back to hub
    await expect(summaryInput).toBeVisible({ timeout: 15_000 })
    await expect(summaryInput).toHaveValue('Hello world')

    await expect(
      popup.getByRole('progressbar', {
        name: 'Wizard progress: 2 of 2 fields completed'
      })
    ).toBeVisible()
  })
})
