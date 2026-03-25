import { expect, test } from '../fixtures'

test.describe('Options - General Settings', () => {
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
