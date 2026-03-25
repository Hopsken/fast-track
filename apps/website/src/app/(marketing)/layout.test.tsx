import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MarketingLayout from './layout'

vi.mock('../../components/landing/Header', () => ({
  Header: () => <div data-testid="landing-header">Header</div>
}))

vi.mock('../../components/landing/Footer', () => ({
  Footer: () => <div data-testid="landing-footer">Footer</div>
}))

describe('MarketingLayout', () => {
  it('wraps children with the shared landing shell', () => {
    render(
      <MarketingLayout>
        <div data-testid="page-body">Body</div>
      </MarketingLayout>
    )

    expect(screen.getByTestId('landing-header')).not.toBeNull()
    expect(screen.getByTestId('page-body')).not.toBeNull()
    expect(screen.getByTestId('landing-footer')).not.toBeNull()
  })
})
