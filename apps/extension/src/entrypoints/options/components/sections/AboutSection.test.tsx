import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AboutSection } from './AboutSection'

describe('AboutSection', () => {
  it('links to the source code on GitHub', () => {
    render(<AboutSection version="2.7.3" />)

    expect(
      screen
        .getByRole('link', { name: /github\.com\/Hopsken\/fast-track/ })
        .getAttribute('href')
    ).toBe('https://github.com/Hopsken/fast-track')
  })
})
