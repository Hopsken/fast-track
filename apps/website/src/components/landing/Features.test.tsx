import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Features } from './Features'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    fill,
    ...props
  }: {
    alt: string
    fill?: boolean
    src: string
  }) => <img alt={alt} src={src} {...props} />
}))

describe('Features', () => {
  it('renders the workflow story in order', () => {
    render(<Features />)

    expect(
      screen.getByRole('heading', {
        name: 'One popup. Three faster steps.'
      })
    ).not.toBeNull()

    const stepLabels = screen.getAllByText(
      /0[1-3] \/ (Find the right work|Move work forward|Repeat work without retyping)/
    )
    expect(stepLabels).toHaveLength(3)

    expect(
      screen.getByRole('heading', {
        name: 'Find the right issue fast.'
      })
    ).not.toBeNull()
    expect(
      screen.getByRole('heading', {
        name: 'Keep work moving from the same place.'
      })
    ).not.toBeNull()
    expect(
      screen.getByRole('heading', {
        name: 'Make repeat tickets one step.'
      })
    ).not.toBeNull()
    expect(
      screen.queryByRole('heading', {
        name: 'Master your board without a mouse'
      })
    ).toBeNull()
  })
})
