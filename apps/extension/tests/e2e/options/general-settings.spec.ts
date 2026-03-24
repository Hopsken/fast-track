import { expect, test } from '../fixtures'

test.describe('Options - General Settings structure', () => {
  test('renders all section labels', async ({ openExtensionPage }) => {
    const options = await openExtensionPage('options.html')

    await expect(
      options.getByRole('heading', { name: 'Jira Connection' })
    ).toBeVisible()
    await expect(
      options.getByRole('heading', { name: 'Quick Access' })
    ).toBeVisible()
    await expect(
      options.getByRole('heading', { name: 'Workflow' })
    ).toBeVisible()
    await expect(
      options.getByRole('heading', { name: 'Privacy' })
    ).toBeVisible()
  })

  test('renders branch name format input', async ({ openExtensionPage }) => {
    const options = await openExtensionPage('options.html')

    const input = options.locator('[name="branch-name-format"]')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', '{key}-{summary}')
  })

  test('workflow toggles render and respond to interaction', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    const copyBranchToggle = options.locator('#auto-copy-branch-name')
    const assignToggle = options.locator('#auto-assign-on-in-progress')

    await expect(copyBranchToggle).toBeVisible()
    await expect(assignToggle).toBeVisible()

    // Toggle auto-copy-branch and verify label flips
    const copyBranchLabel = options.locator('label[for="auto-copy-branch-name"]')
    const initialState =
      (await copyBranchToggle.getAttribute('aria-checked')) === 'true'

    await copyBranchToggle.click()

    await expect(copyBranchToggle).toHaveAttribute(
      'aria-checked',
      (!initialState).toString()
    )
    await expect(copyBranchLabel).toHaveText(initialState ? 'Off' : 'On')
  })

  test('analytics toggle renders with On/Off label', async ({
    openExtensionPage
  }) => {
    const options = await openExtensionPage('options.html')

    const analyticsToggle = options.locator('#analytics-enabled')
    const statusLabel = options.locator('label[for="analytics-enabled"]')

    await expect(analyticsToggle).toBeVisible()

    const checked =
      (await analyticsToggle.getAttribute('aria-checked')) === 'true'
    await expect(statusLabel).toHaveText(checked ? 'On' : 'Off')
  })
})
