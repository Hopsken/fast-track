import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  NavigationProvider,
  useClearRouteState,
  useNavigation,
  useRouteState
} from './navigation'

function RootMenu() {
  const navigate = useNavigation()
  const [search, setSearch] = useRouteState('search', '')
  const clearSearch = useClearRouteState('search')

  return (
    <div>
      <span data-testid="screen">root</span>
      <span data-testid="search-value">{search}</span>
      <button onClick={() => setSearch('root-search')}>set-root-search</button>
      <button onClick={clearSearch}>clear-root-search</button>
      <button onClick={() => navigate.push(<ChildMenu label="child" />)}>
        open-child
      </button>
    </div>
  )
}

function ChildMenu({ label }: { label: string }) {
  const navigate = useNavigation()
  const [search, setSearch] = useRouteState('search', '')

  return (
    <div>
      <span data-testid="screen">{label}</span>
      <span data-testid="search-value">{search}</span>
      <button onClick={() => setSearch(`${label}-search`)}>set-search</button>
      <button onClick={() => navigate.push(<ChildMenu label="nested" />)}>
        open-nested
      </button>
      <button onClick={() => navigate.pop()}>go-back</button>
    </div>
  )
}

describe('navigation route state', () => {
  it('clears route state back to initial value', () => {
    render(
      <NavigationProvider>
        <RootMenu />
      </NavigationProvider>
    )

    fireEvent.click(screen.getByText('set-root-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('root-search')

    fireEvent.click(screen.getByText('clear-root-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('')
  })

  it('keeps previous entry route state after push and pop', () => {
    render(
      <NavigationProvider>
        <RootMenu />
      </NavigationProvider>
    )

    fireEvent.click(screen.getByText('set-root-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('root-search')

    fireEvent.click(screen.getByText('open-child'))
    expect(screen.getByTestId('screen').textContent).toBe('child')
    expect(screen.getByTestId('search-value').textContent).toBe('')

    fireEvent.click(screen.getByText('set-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('child-search')

    fireEvent.click(screen.getByText('go-back'))
    expect(screen.getByTestId('screen').textContent).toBe('root')
    expect(screen.getByTestId('search-value').textContent).toBe('root-search')
  })

  it('isolates route state between different navigation entries', () => {
    render(
      <NavigationProvider>
        <RootMenu />
      </NavigationProvider>
    )

    fireEvent.click(screen.getByText('open-child'))
    fireEvent.click(screen.getByText('set-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('child-search')

    fireEvent.click(screen.getByText('open-nested'))
    expect(screen.getByTestId('screen').textContent).toBe('nested')
    expect(screen.getByTestId('search-value').textContent).toBe('')

    fireEvent.click(screen.getByText('set-search'))
    expect(screen.getByTestId('search-value').textContent).toBe('nested-search')

    fireEvent.click(screen.getByText('go-back'))
    expect(screen.getByTestId('screen').textContent).toBe('child')
    expect(screen.getByTestId('search-value').textContent).toBe('child-search')
  })
})
