import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InputSearch, type SearchOption } from './InputSearch'

describe('InputSearch', () => {
  it('shows the selected option label as the input value (not just placeholder)', async () => {
    const onSelect = vi.fn()
    const getRecommendations = vi
      .fn<() => Promise<SearchOption[]>>()
      .mockResolvedValue([
        { value: 'TMP', label: 'TMP — Team Management Kanban' }
      ])

    function Harness() {
      const [value, setValue] = React.useState<string | undefined>(undefined)

      return (
        <InputSearch
          placeholder="Search projects…"
          value={value}
          onSelect={(opt) => {
            onSelect(opt)
            setValue(opt?.value)
          }}
          getRecommendations={getRecommendations}
          minSearchLength={1}
        />
      )
    }

    render(<Harness />)

    const input = screen.getByPlaceholderText(
      'Search projects…'
    ) as HTMLInputElement

    await act(async () => {
      fireEvent.mouseDown(input)
    })

    await waitFor(() => {
      expect(getRecommendations).toHaveBeenCalled()
    })

    const option = await screen.findByText('TMP — Team Management Kanban')

    await act(async () => {
      fireEvent.click(option)
    })

    await waitFor(() => {
      expect(input.value).toBe('TMP — Team Management Kanban')
      expect(input.placeholder).toBe('Search projects…')
    })

    expect(onSelect).toHaveBeenCalledWith({
      value: 'TMP',
      label: 'TMP — Team Management Kanban'
    })
  })
})
