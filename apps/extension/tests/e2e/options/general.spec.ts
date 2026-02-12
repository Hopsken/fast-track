import { expect, test } from '../fixtures'

test.describe('Options - General Settings', () => {
  test('General tab is selected by default', async ({ openExtensionPage }) => {
    const options = await openExtensionPage('options.html')

    const generalTab = options.getByRole('link', { name: 'General' })
    await expect(generalTab).toHaveClass(/border-blue-500/)
    await expect(generalTab).toHaveClass(/text-blue-600/)
  })

  test('allows toggling analytics preference', async ({ openExtensionPage }) => {
    const options = await openExtensionPage('options.html')

    const analyticsToggle = options.locator('#analytics-enabled')
    const statusLabel = options.locator('label[for="analytics-enabled"]')

    // Get initial state
    const initialChecked =
      (await analyticsToggle.getAttribute('aria-checked')) === 'true'

    // Toggle analytics
    await analyticsToggle.click()

    // Verify the toggle changed
    await expect(analyticsToggle).toHaveAttribute(
      'aria-checked',
      (!initialChecked).toString()
    )
    await expect(statusLabel).toHaveText(initialChecked ? 'Off' : 'On')
  })

  test('analytics preference persists after reload', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    const analyticsToggle = options.locator('#analytics-enabled')

    // Get initial state and toggle
    const initialChecked =
      (await analyticsToggle.getAttribute('aria-checked')) === 'true'
    await analyticsToggle.click()

    // Reload and verify persisted state
    await options.reload()

    const toggleAfterReload = options.locator('#analytics-enabled')
    await expect(toggleAfterReload).toHaveAttribute(
      'aria-checked',
      (!initialChecked).toString()
    )
  })
})
