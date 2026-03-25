import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CHROME_WEB_STORE_URL, pricingPlans } from '../../../lib/pricing'

import PricingPage from './page'

describe('PricingPage', () => {
  it('renders both Free and Pro plans with the expected CTAs', () => {
    const { container } = render(<PricingPage />)
    const [freePlan, proPlan] = pricingPlans

    expect(screen.getAllByRole('heading')).toHaveLength(3)
    expect(screen.getByRole('heading', { name: freePlan.name })).not.toBeNull()
    expect(screen.getByRole('heading', { name: proPlan.name })).not.toBeNull()
    expect(screen.getByText(freePlan.description)).not.toBeNull()
    expect(screen.getByText(proPlan.description)).not.toBeNull()
    for (const feature of freePlan.features) {
      expect(screen.getByText(feature)).not.toBeNull()
    }
    for (const feature of proPlan.features) {
      expect(screen.getByText(feature)).not.toBeNull()
    }
    expect(
      screen
        .getByRole('link', { name: 'Add to Chrome free' })
        .getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
    expect(screen.getByText(proPlan.price)).not.toBeNull()
    expect(screen.getByText(proPlan.priceSuffix)).not.toBeNull()
    expect(
      screen.getByRole('button', { name: 'Upgrade to Pro' })
    ).not.toBeNull()
    expect(
      container.querySelector('form[action="/api/billing/checkout"]')
    ).not.toBeNull()
  })
})
