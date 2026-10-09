import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CHROME_WEB_STORE_URL } from '../../lib/constants'

import { Hero } from './Hero'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode }) => (
      <div {...props}>{children}</div>
    )
  }
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    priority,
    src,
    ...props
  }: {
    alt: string
    priority?: boolean
    src: string
  }) => <img alt={alt} src={src} {...props} />
}))

describe('Hero', () => {
  it('leads with the popup-first value proposition', () => {
    render(<Hero />)

    expect(
      screen.getByRole('heading', {
        name: 'Jira, without the friction.'
      })
    ).not.toBeNull()
    expect(
      screen.getByText(
        'Find the right issue, take the next step, and reuse repeat work without digging through Jira.'
      )
    ).not.toBeNull()
    expect(
      screen
        .getByRole('link', { name: "Add to Chrome - It's free" })
        .getAttribute('href')
    ).toBe(CHROME_WEB_STORE_URL)
  })
})
