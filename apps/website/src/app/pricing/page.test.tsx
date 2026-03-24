import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CHROME_WEB_STORE_URL } from '../../lib/pricing'

import PricingPage from './page'

vi.mock('../../components/landing/Header', () => ({
  Header: () => <div data-testid="header" />
}))

describe('PricingPage', () => {
  it('renders both Free and Pro plans with the expected CTAs', () => {
    const { container } = render(<PricingPage />)

    expect(
      screen.getByRole('heading', {
        name: 'Start free. Upgrade when limits matter.'
      })
    ).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Free' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pro' })).not.toBeNull()
    expect(
      screen.getByRole('link', { name: 'Add to Chrome' }).getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
    expect(
      container.querySelector('form[action="/api/billing/checkout"]')
    ).not.toBeNull()
  })
})
