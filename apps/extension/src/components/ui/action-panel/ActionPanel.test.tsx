import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ActionPanel } from './ActionPanel'

describe('ActionPanel', () => {
  it('preserves render order across sections and actions', async () => {
    const callbacks = {
      first: vi.fn(),
      second: vi.fn(),
      third: vi.fn(),
      fourth: vi.fn()
    }

    render(
      <ActionPanel title="Ordered actions">
        <ActionPanel.Section title="First section">
          <ActionPanel.Action title="First" onAction={callbacks.first} />
          <ActionPanel.Action title="Second" onAction={callbacks.second} />
        </ActionPanel.Section>

        <ActionPanel.Section title="Second section">
          <ActionPanel.Action title="Third" onAction={callbacks.third} />
          <ActionPanel.Action title="Fourth" onAction={callbacks.fourth} />
        </ActionPanel.Section>
      </ActionPanel>
    )

    const items = await screen.findAllByRole('menuitem')

    expect(
      items.map((item) =>
        within(item)
          .getByText(/First|Second|Third|Fourth/)
          .textContent?.trim()
      )
    ).toEqual(['First', 'Second', 'Third', 'Fourth'])

    const panel = screen.getByRole('menu')
    panel.focus()
    fireEvent.keyDown(panel, { key: 'Enter' })

    expect(callbacks.first).toHaveBeenCalled()
  })

  it('opens submenus with keyboard and keeps child ordering', async () => {
    const callbacks = {
      root: vi.fn(),
      childOne: vi.fn(),
      childTwo: vi.fn()
    }

    render(
      <ActionPanel title="Submenu panel">
        <ActionPanel.Section title="Navigate">
          <ActionPanel.Action title="Root action" onAction={callbacks.root} />
          <ActionPanel.Submenu title="Child menu">
            <ActionPanel.Action
              title="Child one"
              onAction={callbacks.childOne}
            />
            <ActionPanel.Action
              title="Child two"
              onAction={callbacks.childTwo}
            />
          </ActionPanel.Submenu>
        </ActionPanel.Section>
      </ActionPanel>
    )

    const panel = screen.getByRole('menu')
    panel.focus()

    await screen.findAllByRole('menuitem')
    fireEvent.keyDown(panel, { key: 'ArrowDown' })
    fireEvent.keyDown(panel, { key: 'ArrowRight' })

    const submenuItems = await screen.findAllByRole('menuitem')

    expect(
      submenuItems.map((item) =>
        within(item).getByText(/Child/).textContent?.trim()
      )
    ).toEqual(['Child one', 'Child two'])

    fireEvent.keyDown(panel, { key: 'Enter' })
    expect(callbacks.childOne).toHaveBeenCalled()

    fireEvent.keyDown(panel, { key: 'ArrowLeft' })
    const rootItems = await screen.findAllByRole('menuitem')

    expect(
      rootItems.map((item) =>
        within(item)
          .getByText(/Root action|Child menu/)
          .textContent?.trim()
      )
    ).toEqual(['Root action', 'Child menu'])
  })

  it('filters actions via the search input', async () => {
    const callbacks = {
      visible: vi.fn(),
      hidden: vi.fn()
    }

    render(
      <ActionPanel title="Filterable">
        <ActionPanel.Section title="Commands">
          <ActionPanel.Action
            title="Copy Issue Key"
            onAction={callbacks.visible}
          />
          <ActionPanel.Action title="Open issue" onAction={callbacks.hidden} />
        </ActionPanel.Section>
      </ActionPanel>
    )

    const search = screen.getByPlaceholderText(/search for actions/i)
    fireEvent.change(search, { target: { value: 'copy' } })

    const items = await screen.findAllByRole('menuitem')

    expect(items).toHaveLength(1)
    expect(
      within(items[0])
        .getByText(/Copy Issue Key/)
        .textContent?.trim()
    ).toEqual('Copy Issue Key')
    expect(screen.queryByText('Open issue')).toBeNull()

    const panel = screen.getByRole('menu')
    panel.focus()
    fireEvent.keyDown(panel, { key: 'Enter' })

    expect(callbacks.visible).toHaveBeenCalled()
    expect(callbacks.hidden).not.toHaveBeenCalled()
  })
})
