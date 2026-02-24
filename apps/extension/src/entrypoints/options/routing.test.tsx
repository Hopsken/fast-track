import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import OptionsPage from './App'

vi.mock('@/components/QueryClientProvider', () => ({
  QueryClientProvider: (props: { children: React.ReactNode }) => props.children
}))

vi.mock('~/stores/useUserPreferences', () => ({
  UserPreferencesProvider: (props: { children: React.ReactNode }) =>
    props.children
}))

vi.mock('./components', () => ({
  OptionsHeader: () => <div>OptionsHeader</div>,
  TabNavigation: () => <div>TabNavigation</div>,
  AboutTab: () => <div>AboutTab</div>
}))

vi.mock('./components/tabs/GeneralTab', () => ({
  GeneralTab: () => <div>GeneralTab</div>
}))

vi.mock('./components/tabs/WorkflowTab', () => ({
  WorkflowTab: () => <div>WorkflowTab</div>
}))

vi.mock('./routes/templates/TemplateWizardPage', () => ({
  TemplateWizardPage: () => <div>TemplateWizardPage</div>
}))

vi.mock('./routes/templates/TemplateDetailPage', () => ({
  TemplateDetailPage: () => <div>TemplateDetailPage</div>
}))

describe('options routing', () => {
  it('routes /workflow/templates to workflow tab (combined view)', () => {
    window.location.hash = '#/workflow/templates'
    render(<OptionsPage />)
    expect(screen.getByText('WorkflowTab')).toBeTruthy()
  })

  it('routes /workflow to workflow tab', () => {
    window.location.hash = '#/workflow'
    render(<OptionsPage />)
    expect(screen.getByText('WorkflowTab')).toBeTruthy()
  })

  it('does not keep old /templates route (falls back to General)', () => {
    window.location.hash = '#/templates'
    render(<OptionsPage />)
    expect(screen.getByText('GeneralTab')).toBeTruthy()
  })
})
