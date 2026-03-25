import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AppLayout from './layout'

vi.mock('../../components/landing/Header', () => ({
  Header: () => <div data-testid="app-header">Header</div>
}))

describe('AppLayout', () => {
  it('wraps signed-in pages with the shared header only', () => {
    render(
      <AppLayout>
        <div data-testid="app-body">Body</div>
      </AppLayout>
    )

    expect(screen.getByTestId('app-header')).not.toBeNull()
    expect(screen.getByTestId('app-body')).not.toBeNull()
  })
})
