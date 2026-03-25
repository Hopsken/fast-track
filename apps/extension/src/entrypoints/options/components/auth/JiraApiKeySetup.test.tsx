import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { JiraApiKeySetup } from './JiraApiKeySetup'

describe('JiraApiKeySetup', () => {
  it('shows validation errors for empty fields', async () => {
    render(<JiraApiKeySetup onConnect={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByText('Jira site URL is required')).toBeDefined()
    expect(screen.getByText('Jira account email is required')).toBeDefined()
    expect(screen.getByText('API token is required')).toBeDefined()
  })

  it('shows validation error for invalid email', async () => {
    const { container } = render(<JiraApiKeySetup onConnect={vi.fn()} />)

    container.querySelector('form')?.setAttribute('novalidate', 'true')

    fireEvent.change(screen.getByLabelText('Jira site URL'), {
      target: { value: 'https://my-jira.atlassian.net' }
    })
    fireEvent.change(screen.getByLabelText('Jira account email'), {
      target: { value: 'not-an-email' }
    })
    fireEvent.change(screen.getByLabelText('API token'), {
      target: { value: 'token' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByText('Enter a valid email address')).toBeDefined()
  })

  it('shows validation error for invalid URL', async () => {
    render(<JiraApiKeySetup onConnect={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Jira site URL'), {
      target: { value: 'not-a-url' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByText('Enter a valid Jira site URL')).toBeDefined()
  })

  it('submits normalized values through the form', async () => {
    const onConnect = vi.fn()

    render(<JiraApiKeySetup onConnect={onConnect} />)

    fireEvent.change(screen.getByLabelText('Jira site URL'), {
      target: { value: 'https://my-jira.atlassian.net' }
    })
    fireEvent.change(screen.getByLabelText('Jira account email'), {
      target: { value: 'me@company.com' }
    })
    fireEvent.change(screen.getByLabelText('API token'), {
      target: { value: 'secret-token' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalledWith({
        host: 'https://my-jira.atlassian.net',
        email: 'me@company.com',
        apiKey: 'secret-token'
      })
    })
  })
})
