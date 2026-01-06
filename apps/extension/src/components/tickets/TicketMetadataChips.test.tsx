import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { IssueDetail, JiraTicket } from '@/types'

import { TicketMetadataChips } from './TicketMetadataChips'

describe('TicketMetadataChips', () => {
  const mockTicket: JiraTicket = {
    id: '1',
    key: 'TEST-1',
    summary: 'Test',
    status: { name: 'Done', statusCategory: { colorName: 'green' } },
    issueType: { name: 'Bug', iconUrl: 'bug.png' },
    priority: { name: 'High', iconUrl: 'high.png' }
  } as any

  it('renders basic chips', () => {
    render(<TicketMetadataChips ticket={mockTicket} />)
    expect(screen.getByText('Done')).toBeDefined()
    expect(screen.getByText('High')).toBeDefined()
  })

  it('renders labels if present', () => {
    const detailTicket: IssueDetail = {
      ...mockTicket,
      labels: ['frontend', 'backend', 'urgent', 'v1']
    } as any
    render(<TicketMetadataChips ticket={detailTicket} />)
    expect(screen.getByText('frontend')).toBeDefined()
    expect(screen.getByText('backend')).toBeDefined()
    expect(screen.getByText('urgent')).toBeDefined()
    expect(screen.getByText('+1')).toBeDefined()
  })
})
