import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  NavigationProvider,
  useClearRouteState,
  useNavigation,
  useNavigationBreadcrumb,
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
      <button
        onClick={() =>
          navigate.push(<ChildMenu label="titled-child" />, { title: 'Child' })
        }>
        open-titled-child
      </button>
    </div>
  )
}

function BreadcrumbDisplay() {
  const segments = useNavigationBreadcrumb()
  return <span data-testid="breadcrumb">{segments.join(' › ')}</span>
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
      <button
        onClick={() =>
          navigate.push(<ChildMenu label="titled-nested" />, {
            title: 'Nested'
          })
        }>
        open-titled-nested
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

// BreadcrumbDisplay is rendered outside NavigationProvider so it remains
// mounted regardless of which stack entry is active (NavigationProvider
// swaps children for the top-of-stack target, which would unmount it).
// The navigation store is a singleton, so reads still reflect current state.
describe('useNavigationBreadcrumb', () => {
  it('returns empty array at root', () => {
    render(
      <>
        <BreadcrumbDisplay />
        <NavigationProvider>
          <RootMenu />
        </NavigationProvider>
      </>
    )
    expect(screen.getByTestId('breadcrumb').textContent).toBe('')
  })

  it('stores title from push options', () => {
    render(
      <>
        <BreadcrumbDisplay />
        <NavigationProvider>
          <RootMenu />
        </NavigationProvider>
      </>
    )

    fireEvent.click(screen.getByText('open-titled-child'))
    expect(screen.getByTestId('breadcrumb').textContent).toBe('Child')
  })

  it('filters out entries pushed without a title', () => {
    render(
      <>
        <BreadcrumbDisplay />
        <NavigationProvider>
          <RootMenu />
        </NavigationProvider>
      </>
    )

    fireEvent.click(screen.getByText('open-child'))
    expect(screen.getByTestId('breadcrumb').textContent).toBe('')
  })

  it('builds multi-segment breadcrumb after nested pushes', () => {
    render(
      <>
        <BreadcrumbDisplay />
        <NavigationProvider>
          <RootMenu />
        </NavigationProvider>
      </>
    )

    fireEvent.click(screen.getByText('open-titled-child'))
    fireEvent.click(screen.getByText('open-titled-nested'))
    expect(screen.getByTestId('breadcrumb').textContent).toBe('Child › Nested')
  })

  it('removes last segment on pop', () => {
    render(
      <>
        <BreadcrumbDisplay />
        <NavigationProvider>
          <RootMenu />
        </NavigationProvider>
      </>
    )

    fireEvent.click(screen.getByText('open-titled-child'))
    fireEvent.click(screen.getByText('open-titled-nested'))
    fireEvent.click(screen.getByText('go-back'))
    expect(screen.getByTestId('breadcrumb').textContent).toBe('Child')
  })
})
