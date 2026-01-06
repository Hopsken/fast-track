import React from 'react'
import { Command } from '@internal/ui/components/command'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JiraTicket } from '@/types'

import { TicketHeaderAction } from './TicketHeaderAction'

describe('TicketHeaderAction', () => {
  const mockTicket: JiraTicket = {
    key: 'TEST-1',
    summary: 'Summary',
    status: { name: 'Done', statusCategory: { colorName: 'green' } },
    issueType: { name: 'Bug' },
    priority: { name: 'High' }
  } as any

  it('renders ticket info', () => {
    render(
      <Command>
        <TicketHeaderAction ticket={mockTicket} onSelect={() => {}} />
      </Command>
    )
    expect(screen.getByText('TEST-1')).toBeDefined()
    expect(screen.getByText('Summary')).toBeDefined()
  })
})
