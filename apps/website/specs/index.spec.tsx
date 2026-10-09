import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Page from '../src/app/(marketing)/page'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    alt: string
    fill?: boolean
  }) =>
    React.createElement('img', { alt, ...props })
}))

vi.mock('../src/components/landing/Header', () => ({
  Header: () => <div>Header</div>
}))

vi.mock('../src/components/landing/Hero', () => ({
  Hero: () => <div>Hero</div>
}))

vi.mock('../src/components/landing/Footer', () => ({
  Footer: () => <div>Footer</div>
}))

describe('Page', () => {
  it('highlights issue templates as a homepage feature', async () => {
    render(<Page />)

    expect(
      screen.getByRole('heading', {
        name: /make repeat tickets one step/i
      })
    ).toBeTruthy()
    expect(
      screen.getByText(
        /save templates for repeat work so scope, fields, and defaults are ready before you start typing/i
      )
    ).toBeTruthy()
  })
})
