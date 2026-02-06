import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JiraIssue } from '@/types'

import { TicketBasicFields } from './TicketBasicFields'

describe('TicketBasicFields', () => {
  const mockTicket: JiraIssue = {
    key: 'TEST-1',
    summary: 'Summary',
    status: { name: 'Done', statusCategory: { colorName: 'green' } },
    issueType: { name: 'Bug' },
    priority: { name: 'High' }
  } as unknown as JiraIssue

  it('renders ticket info', () => {
    render(<TicketBasicFields ticket={mockTicket} />)
    expect(screen.getByText('TEST-1')).toBeDefined()
    expect(screen.getByText('Summary')).toBeDefined()
  })
})
