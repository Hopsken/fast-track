import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CHROME_WEB_STORE_URL } from '../../../lib/pricing'

import PricingPage from './page'

describe('PricingPage', () => {
  it('renders both Free and Pro plans with the expected CTAs', () => {
    const { container } = render(<PricingPage />)

    expect(
      screen.getByRole('heading', {
        name: 'Get through Jira faster. Pay only when templates save you enough time to matter.'
      })
    ).not.toBeNull()
    expect(
      screen.getByText(
        'Start free. Upgrade when templates become part of your daily work.'
      )
    ).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Free' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Pro' })).not.toBeNull()
    expect(
      screen
        .getByRole('link', { name: 'Add to Chrome free' })
        .getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
    expect(
      container.querySelector('form[action="/api/billing/checkout"]')
    ).not.toBeNull()
  })
})
