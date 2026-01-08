import { expect, test } from '@playwright/test'

import { closeContext, launchExtensionContext } from './extension-fixture'

test.describe('Fast Track extension', () => {
  test.skip('shows connect notice in popup and opens options page', async () => {
    const { context, openExtensionPage } = await launchExtensionContext()

    try {
      const popupPage = await openExtensionPage('popup.html')

      await expect(popupPage.getByText('Connect to Jira')).toBeVisible()

      const [optionsPage] = await Promise.all([
        context.waitForEvent('page', (page) =>
          page.url().includes('options.html')
        ),
        popupPage.getByRole('button', { name: 'Connect' }).click()
      ])

      await optionsPage.waitForLoadState('domcontentloaded')
      await expect(
        optionsPage.getByText('Sign in with Atlassian')
      ).toBeVisible()
    } finally {
      await closeContext(context)
    }
  })

  test.skip('allows toggling analytics preference on options page', async () => {
    const { context, openExtensionPage } = await launchExtensionContext()

    try {
      const optionsPage = await openExtensionPage('options.html')

      const generalTab = optionsPage.getByRole('button', { name: 'General' })
      await expect(generalTab).toHaveClass(/border-blue-500/)
      await expect(generalTab).toHaveClass(/text-blue-600/)

      const analyticsHeading = optionsPage.getByRole('heading', {
        name: 'Anonymous analytics'
      })
      const analyticsToggle = analyticsHeading.getByRole('switch')
      const statusLabel = analyticsToggle.locator('xpath=../label[last()]')

      const initialChecked = await analyticsToggle.isChecked()

      await analyticsToggle.click()
      await expect(analyticsToggle).toHaveJSProperty('checked', !initialChecked)
      await expect(statusLabel).toHaveText(initialChecked ? 'Off' : 'On')

      await optionsPage.reload()

      const analyticsHeadingAfterReload = optionsPage.getByRole('heading', {
        name: 'Anonymous analytics'
      })
      const analyticsToggleAfterReload =
        analyticsHeadingAfterReload.getByRole('switch')

      await expect(analyticsToggleAfterReload).toHaveJSProperty(
        'aria-checked',
        !initialChecked
      )
    } finally {
      await closeContext(context)
    }
  })
})
