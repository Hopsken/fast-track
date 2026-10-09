import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OptionsHeader } from './OptionsHeader'

describe('OptionsHeader', () => {
  it('shows the version next to a link to the source code', () => {
    render(<OptionsHeader version="2.7.3" />)

    expect(screen.getByText(/v2\.7\.3 Settings/)).not.toBeNull()
    expect(
      screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')
    ).toBe('https://github.com/Hopsken/fast-track')
  })
})
