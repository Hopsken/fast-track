import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InputSearch, type SearchOption } from './InputSearch'

describe('InputSearch', () => {
  it('shows the selected option label as the input value (not just placeholder)', async () => {
    const onSelect = vi.fn()

    function Harness() {
      const [value, setValue] = React.useState<string | undefined>(undefined)
      const [query, setQuery] = React.useState('')

      const options: SearchOption[] = query
        ? []
        : [{ value: 'TMP', label: 'TMP — Team Management Kanban' }]

      return (
        <InputSearch
          placeholder="Search projects…"
          value={value}
          onSelect={(opt) => {
            onSelect(opt)
            setValue(opt?.value)
          }}
          query={query}
          onQueryChange={setQuery}
          options={options}
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

  it('keeps showing the selected label even if it came from search results', async () => {
    const onSelect = vi.fn()

    function Harness() {
      const [value, setValue] = React.useState<string | undefined>(undefined)
      const [query, setQuery] = React.useState('')

      const options: SearchOption[] = React.useMemo(() => {
        if (!query) return []
        if (query.toLowerCase().includes('tm')) {
          return [{ value: 'TMP', label: 'TMP — Team Management Kanban' }]
        }
        return []
      }, [query])

      return (
        <InputSearch
          placeholder="Search projects…"
          value={value}
          onSelect={(opt) => {
            onSelect(opt)
            setValue(opt?.value)
          }}
          query={query}
          onQueryChange={setQuery}
          options={options}
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

    await act(async () => {
      fireEvent.change(input, { target: { value: 'tm' } })
    })

    const option = await screen.findByText('TMP — Team Management Kanban')

    await act(async () => {
      fireEvent.click(option)
    })

    await waitFor(() => {
      expect(input.value).toBe('TMP — Team Management Kanban')
    })

    expect(onSelect).toHaveBeenCalledWith({
      value: 'TMP',
      label: 'TMP — Team Management Kanban'
    })
  })
})
