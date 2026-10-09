import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GITHUB_REPO_URL } from '../../lib/constants'

import { Footer } from './Footer'

vi.mock('next/image', () => ({
  __esModule: true,
  default: () => null
}))

describe('Footer', () => {
  it('links to the source code on GitHub', () => {
    render(<Footer />)

    expect(
      screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')
    ).toBe(GITHUB_REPO_URL)
  })
})
