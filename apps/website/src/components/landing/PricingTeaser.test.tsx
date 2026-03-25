import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CHROME_WEB_STORE_URL,
  freeFeatures,
  proFeatures
} from '../../lib/pricing'

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

    expect(screen.getByRole('heading', { level: 2 })).not.toBeNull()
    expect(screen.getByText('Free to start')).not.toBeNull()
    expect(screen.getByText('Pro')).not.toBeNull()
    for (const feature of freeFeatures) {
      expect(screen.getByText(feature)).not.toBeNull()
    }
    for (const feature of proFeatures) {
      expect(screen.getByText(feature)).not.toBeNull()
    }
    expect(
      screen.getByRole('link', { name: 'Add to Chrome' }).getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
    expect(
      screen.getByRole('link', { name: 'Upgrade' }).getAttribute('href')
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

    expect(screen.getByRole('button', { name: 'Upgrade' })).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Upgrade' })).toBeNull()
    expect(
      container.querySelector('form[action="/api/billing/checkout"]')
    ).not.toBeNull()
  })
})
