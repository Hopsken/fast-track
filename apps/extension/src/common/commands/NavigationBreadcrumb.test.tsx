import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NavigationBreadcrumb } from './NavigationBreadcrumb'

describe('NavigationBreadcrumb', () => {
  it('renders nothing for empty segments', () => {
    const { container } = render(<NavigationBreadcrumb segments={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders single segment with no separator', () => {
    render(<NavigationBreadcrumb segments={['PROJ-123']} />)
    expect(screen.getByText('PROJ-123')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
    // No ChevronRight SVG — count svg elements
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBe(0)
  })

  it('renders N-1 chevrons for N segments', () => {
    render(<NavigationBreadcrumb segments={['PROJ-123', 'Status', 'Open']} />)
    expect(screen.getByText('PROJ-123')).toBeTruthy()
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('Open')).toBeTruthy()
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBe(2) // 3 segments → 2 separators
  })

  it('applies truncate class to each segment', () => {
    render(<NavigationBreadcrumb segments={['VERY-LONG-TICKET-KEY-123456']} />)
    const span = screen.getByText('VERY-LONG-TICKET-KEY-123456')
    expect(span.className).toContain('truncate')
    expect(span.className).toContain('max-w-[120px]')
  })
})
