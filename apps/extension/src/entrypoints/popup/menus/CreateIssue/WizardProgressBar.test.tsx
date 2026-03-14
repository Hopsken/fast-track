import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { WizardProgressBar } from './WizardProgressBar'

const mockUseCreateIssueDraftStore = vi.fn()

vi.mock('./useCreateIssueDraftStore', () => ({
  useCreateIssueDraftStore: () => mockUseCreateIssueDraftStore()
}))

describe('WizardProgressBar', () => {
  it('renders a quarter-step pie progress state', () => {
    mockUseCreateIssueDraftStore.mockReturnValue({
      wizardFields: [
        { fieldId: 'description' },
        { fieldId: 'priority' },
        { fieldId: 'labels' }
      ],
      values: {
        summary: 'Test summary',
        description: '',
        priority: '',
        labels: ''
      }
    })

    render(<WizardProgressBar />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('1')
    expect(progressbar.getAttribute('aria-valuetext')).toContain('1/4')
  })

  it('does not report all set before every field is completed', () => {
    mockUseCreateIssueDraftStore.mockReturnValue({
      wizardFields: [
        { fieldId: 'description' },
        { fieldId: 'priority' },
        { fieldId: 'labels' },
        { fieldId: 'assignee' }
      ],
      values: {
        summary: 'Test summary',
        description: 'Details',
        priority: 'High',
        labels: ['release'],
        assignee: ''
      }
    })

    render(<WizardProgressBar />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('3')
    expect(progressbar.getAttribute('aria-valuetext')).toContain('3/4')
    expect(screen.queryByText('All set')).toBeNull()
  })

  it('shows all set when all wizard fields are complete', () => {
    mockUseCreateIssueDraftStore.mockReturnValue({
      wizardFields: [{ fieldId: 'description' }],
      values: {
        summary: 'Test summary',
        description: 'Details'
      }
    })

    render(<WizardProgressBar />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar.getAttribute('aria-valuenow')).toBe('4')
    expect(screen.getByText('All set')).toBeTruthy()
  })
})
