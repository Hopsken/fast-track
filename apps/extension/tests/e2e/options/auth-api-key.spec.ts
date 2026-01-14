import { expect, test } from '../fixtures'

test.describe('Options - API Key Auth', () => {
  test('shows validation errors for empty fields', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    // Select API Key tab
    await options.getByRole('tab', { name: 'API key' }).click()

    // Submit without filling anything
    await options.getByRole('button', { name: 'Connect' }).click()

    // Verify validation messages
    await expect(options.getByText('Jira site URL is required')).toBeVisible()
    await expect(
      options.getByText('Jira account email is required')
    ).toBeVisible()
    await expect(options.getByText('API token is required')).toBeVisible()
  })

  test('shows validation error for invalid email', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    await options.getByRole('tab', { name: 'API key' }).click()

    // Disable native HTML validation to let Zod handle it and show custom errors
    await options.evaluate(() => {
      document.querySelector('form')?.setAttribute('novalidate', 'true')
    })

    // Fill invalid email
    await options
      .getByPlaceholder('https://your-domain.atlassian.net')
      .fill('my-jira.atlassian.net')
    await options.getByPlaceholder('you@company.com').fill('not-an-email')
    await options
      .getByPlaceholder('Paste your Atlassian API token')
      .fill('token')

    await options.getByRole('button', { name: 'Connect' }).click()

    await expect(options.getByText('Enter a valid email address')).toBeVisible()
  })

  test('shows validation error for invalid URL', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    await options.getByRole('tab', { name: 'API key' }).click()

    // Fill invalid URL (empty is handled by required, but z.url() checks format)
    // "not-a-url" might be accepted by z.url() if it interprets as relative?
    // z.url() usually requires protocol?
    // The schema says: .pipe(z.url(...))

    await options
      .getByPlaceholder('https://your-domain.atlassian.net')
      .fill('not-a-url')

    await options.getByRole('button', { name: 'Connect' }).click()

    await expect(options.getByText('Enter a valid Jira site URL')).toBeVisible()
  })
})
