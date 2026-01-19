import { expect, test } from '../fixtures'

test.describe('Popup - Search', () => {
  test('allows typing in the search input', async ({ openAuthenticatedPopup }) => {
    const popup = await openAuthenticatedPopup()

    // cmdk uses role="combobox" for the input, and we have data-slot and aria-label
    const searchInput = popup.locator('[data-slot="command-input"]')
    await expect(searchInput).toBeVisible({ timeout: 15_000 })

    await searchInput.fill('PROJ-123')
    await expect(searchInput).toHaveValue('PROJ-123')
  })

  test('search input clears on escape when has value', async ({
    openAuthenticatedPopup
  }) => {
    const popup = await openAuthenticatedPopup()

    const searchInput = popup.locator('[data-slot="command-input"]')
    await expect(searchInput).toBeVisible({ timeout: 15_000 })

    // Type something
    await searchInput.fill('test query')
    await expect(searchInput).toHaveValue('test query')

    // Press escape - should clear the input (based on the popup's useHotkeys handler)
    await searchInput.press('Escape')
    await expect(searchInput).toHaveValue('')
  })
})
