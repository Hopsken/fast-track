import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PrivacyPage from './page'

describe('PrivacyPage', () => {
  it('renders the normalized editorial structure', () => {
    render(<PrivacyPage />)

    expect(
      screen.getByRole('heading', {
        name: 'Private by default.'
      })
    ).not.toBeNull()
    expect(
      screen.getByText(
        'Fast Track helps you move through Jira faster without turning your work into another dataset.'
      )
    ).not.toBeNull()

    expect(
      screen.getByRole('heading', { name: 'What Fast Track accesses' })
    ).not.toBeNull()
    expect(
      screen.getByRole('heading', { name: 'What stays on your device' })
    ).not.toBeNull()
    expect(
      screen.getByRole('heading', { name: 'Security and permissions' })
    ).not.toBeNull()
    expect(
      screen.getByRole('heading', { name: 'Your choices and contact' })
    ).not.toBeNull()

    expect(screen.getByText('Last updated: March 25, 2026')).not.toBeNull()
    expect(
      screen
        .getByRole('link', { name: 'support@fast-track.work' })
        .getAttribute('href')
    ).toBe('mailto:support@fast-track.work')
  })
})
