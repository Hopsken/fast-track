import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Faq } from './Faq'

describe('Faq', () => {
  it('renders trust-first questions without repeating the old feature-led prompts', () => {
    render(<Faq />)

    expect(
      screen.getByRole('heading', {
        name: 'Before you install.'
      })
    ).not.toBeNull()

    expect(
      screen.getByText('Is Fast Track safe to use with my Jira data?')
    ).not.toBeNull()
    expect(
      screen.getByText('How does Fast Track store my data?')
    ).not.toBeNull()
    expect(screen.getByText('Do I need an account to try it?')).not.toBeNull()
    expect(
      screen.getByText("What's free, and what changes with Pro?")
    ).not.toBeNull()
    expect(screen.getByText('Any AI features?')).not.toBeNull()

    expect(screen.queryByText('What does Fast Track do?')).toBeNull()
    expect(screen.queryByText('What can I search today?')).toBeNull()

    expect(
      screen.getByText(/Search history and Jira responses stay on your device/i)
    ).not.toBeNull()
    expect(
      screen.getByRole('link', { name: 'privacy policy' }).getAttribute('href')
    ).toBe('/privacy')
  })
})
