import { expect, test } from '../fixtures'

test.describe('Popup - Connect Notice', () => {
  test('shows connect notice when not authenticated', async ({
    openExtensionPage
  }) => {
    const popup = await openExtensionPage('popup.html')

    // Wait for the auth notice to appear
    const connectText = popup.getByText('Connect to Jira')
    await expect(connectText).toBeVisible({ timeout: 15_000 })

    // Verify the connect button is present
    const connectButton = popup.getByRole('button', { name: 'Connect' })
    await expect(connectButton).toBeVisible()
  })

  test('connect button opens options page', async ({
    context,
    extensionId,
    openExtensionPage
  }) => {
    const popup = await openExtensionPage('popup.html')

    // Wait for connect notice to appear
    await expect(popup.getByText('Connect to Jira')).toBeVisible({
      timeout: 15_000
    })

    // Click connect button - this opens options page and closes popup
    await popup.getByRole('button', { name: 'Connect' }).click()

    // Poll for the options page using expect.poll
    await expect
      .poll(
        () => {
          const pages = context.pages()
          return pages.find((page) => {
            const url = page.url()
            return (
              url.includes('options.html') ||
              url.includes(`${extensionId}/options`)
            )
          })
        },
        {
          message: 'Options page should open',
          timeout: 10_000,
          intervals: [200, 500]
        }
      )
      .toBeDefined()

    // Get the found page for assertions
    const optionsPage = context.pages().find((page) => {
      const url = page.url()
      return (
        url.includes('options.html') || url.includes(`${extensionId}/options`)
      )
    })! // We know it exists because of expect.poll above

    await optionsPage.waitForLoadState('domcontentloaded')
    // Look for the "Sign in with Atlassian" tab button specifically
    await expect(
      optionsPage.getByRole('tab', { name: 'Sign in with Atlassian' })
    ).toBeVisible()
  })
})
