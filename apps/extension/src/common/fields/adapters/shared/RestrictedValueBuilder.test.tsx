import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { FieldConfig, JiraFieldMetadata } from '@/repository/schema'

import type {
  FieldAdapter,
  JiraFieldContext,
  SelectComponentProps
} from '../../types'

import { FieldContextProvider } from './context'
import { RestrictedValueBuilder } from './RestrictedValueBuilder'

const DummyInputSelector = ({
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  return (
    <input
      aria-label="selector"
      value={Array.isArray(value) ? value.join(',') : (value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return
        onConfirm?.(e.currentTarget.value)
      }}
    />
  )
}

function renderWithStringAdapter(ui: React.ReactNode) {
  const adapter: FieldAdapter<z.ZodString> = {
    key: 'string',
    schema: z.string(),
    keyOf: (v) => v,
    labelOf: (v) => v,
    ConfigComponent: () => null,
    InputComponent: () => null,
    toDTO: (v) => v,
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }

  const metadata: JiraFieldMetadata = {
    fieldId: 'f',
    key: 'f',
    name: 'F',
    required: false,
    schema: { type: 'string' },
    allowedValues: []
  }

  const context: JiraFieldContext = {
    metadata
  }

  const config: FieldConfig<string> = {
    fieldId: 'f',
    behavior: 'restricted',
    allowedOptions: []
  }

  return render(
    <FieldContextProvider adapter={adapter} context={context} config={config}>
      {ui}
    </FieldContextProvider>
  )
}

describe('RestrictedValueBuilder (commit semantics)', () => {
  it('does not add on draft change; adds on selector onConfirm (Enter)', () => {
    const onChange = vi.fn()

    renderWithStringAdapter(
      <RestrictedValueBuilder
        values={[]}
        onChange={onChange}
        SelectorComponent={DummyInputSelector}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /add value/i }))

    const input = screen.getByLabelText('selector')
    fireEvent.change(input, { target: { value: 'a' } })

    // Draft updates should not create options.
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('adds on explicit Add button (works even when Enter is not usable)', () => {
    const onChange = vi.fn()

    renderWithStringAdapter(
      <RestrictedValueBuilder
        values={[]}
        onChange={onChange}
        SelectorComponent={DummyInputSelector}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /add value/i }))

    const input = screen.getByLabelText('selector')
    fireEvent.change(input, { target: { value: 'b' } })

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['b'])
  })
})
