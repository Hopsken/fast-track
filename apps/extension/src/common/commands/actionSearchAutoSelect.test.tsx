import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HotkeysProvider } from '@/lib/hotkeys'

import { ActionPanel } from './ActionPanel'
import { NavigationProvider } from './navigation'

describe('ActionSearch auto select', () => {
  it('selects all text on mount when enabled and initial value is non-empty', async () => {
    render(
      <HotkeysProvider>
        <NavigationProvider>
          <ActionPanel
            search="hello"
            onSearchChange={() => {}}
            autoSelectSearchOnMount
            searchPlaceholder="Search"
          />
        </NavigationProvider>
      </HotkeysProvider>
    )

    const input = screen.getByLabelText('Search') as HTMLInputElement

    await waitFor(() => {
      expect(document.activeElement).toBe(input)
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(input.value.length)
    })
  })

  it('does not select when autoSelectSearchOnMount is disabled', async () => {
    render(
      <HotkeysProvider>
        <NavigationProvider>
          <ActionPanel
            search="hello"
            onSearchChange={() => {}}
            searchPlaceholder="Search"
          />
        </NavigationProvider>
      </HotkeysProvider>
    )

    const input = screen.getByLabelText('Search') as HTMLInputElement

    await waitFor(() => {
      expect(document.activeElement).toBe(input)
    })

    expect(input.selectionStart).toBe(input.selectionEnd)
  })
})
