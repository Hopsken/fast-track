import { expect, test } from '@playwright/test'

import { closeContext, launchExtensionContext } from './extension-fixture'

test.describe('Fast Track extension options', () => {
  test('allows toggling analytics preference on options page', async () => {
    const { context, openExtensionPage } = await launchExtensionContext()

    try {
      const optionsPage = await openExtensionPage('options.html')

      const generalTab = optionsPage.getByRole('button', { name: 'General' })
      await expect(generalTab).toHaveClass(/border-blue-500/)
      await expect(generalTab).toHaveClass(/text-blue-600/)

      const analyticsToggle = optionsPage.locator('#analytics-enabled')
      const statusLabel = optionsPage.locator(
        'label[for="analytics-enabled"]'
      )

      const initialChecked =
        (await analyticsToggle.getAttribute('aria-checked')) === 'true'

      await analyticsToggle.click()
      await expect(analyticsToggle).toHaveAttribute(
        'aria-checked',
        (!initialChecked).toString()
      )
      await expect(statusLabel).toHaveText(initialChecked ? 'Off' : 'On')

      await optionsPage.reload()

      const analyticsToggleAfterReload =
        optionsPage.locator('#analytics-enabled')

      await expect(analyticsToggleAfterReload).toHaveAttribute(
        'aria-checked',
        (!initialChecked).toString()
      )
    } finally {
      await closeContext(context)
    }
  })
})
