import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CHROME_WEB_STORE_URL } from '../../lib/pricing'

import { PricingTeaser } from './PricingTeaser'

const getUserMock = vi.fn()

vi.mock('../../lib/supabase/server', () => ({
  createSupabaseServerClientReadOnly: async () => ({
    auth: {
      getUser: getUserMock
    }
  })
}))

describe('PricingTeaser', () => {
  beforeEach(() => {
    getUserMock.mockReset()
  })

  it('leads with the Free plan and keeps Pro secondary for signed-out visitors', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: null
      }
    })

    render(await PricingTeaser())

    expect(
      screen.getByRole('heading', {
        name: 'Try the faster way to use Jira.'
      })
    ).not.toBeNull()
    expect(screen.getByText('Search Jira faster')).not.toBeNull()
    expect(
      screen.getByRole('link', { name: 'Add to Chrome' }).getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
    expect(
      screen
        .getByRole('link', { name: 'Sign in to upgrade' })
        .getAttribute('href')
    ).toBe('/login')
  })

  it('shows checkout for signed-in users inside the Pro card', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1'
        }
      }
    })

    const { container } = render(await PricingTeaser())

    expect(
      screen.getByRole('button', { name: 'Upgrade to Pro' })
    ).not.toBeNull()
    expect(
      container.querySelector('form[action="/api/billing/checkout"]')
    ).not.toBeNull()
  })
})
