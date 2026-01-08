import { expect, test } from '@playwright/test'

import { closeContext, launchExtensionContext } from './extension-fixture'

test.describe('Fast Track extension popup', () => {
  test('shows connect notice in popup and opens options page', async () => {
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

  test('allows typing in the popup search input', async () => {
    const { context, openExtensionPage } = await launchExtensionContext()

    try {
      const popupPage = await openExtensionPage('popup.html')
      const searchInput = popupPage.getByRole('textbox', {
        name: 'Search tickets'
      })

      await searchInput.fill('hi')
      await expect(searchInput).toHaveValue('hi')
    } finally {
      await closeContext(context)
    }
  })
})
