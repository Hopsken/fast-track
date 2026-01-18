import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Page from '../src/app/page'

describe('Page', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = render(<Page />)
    expect(baseElement).toBeTruthy()
  })
})
