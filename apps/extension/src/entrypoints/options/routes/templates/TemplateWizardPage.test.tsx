import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { getProjectService } from '~/services/project-service'
import { getTemplateService } from '~/services/template-service'

import { TemplateWizardPage } from './TemplateWizardPage'

vi.mock('~/hooks/useCurrentJiraHost', () => ({
  useCurrentJiraHost: vi.fn()
}))

vi.mock('~/services/project-service', () => ({
  getProjectService: vi.fn()
}))

vi.mock('~/services/template-service', () => ({
  getTemplateService: vi.fn()
}))

describe('TemplateWizardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(useCurrentJiraHost).mockReturnValue({
      host: 'example.atlassian.net',
      isLoading: false,
      error: null
    })

    vi.mocked(getTemplateService).mockReturnValue({
      createTemplate: vi.fn()
    } as unknown as ReturnType<typeof getTemplateService>)
  })

  it('allows selecting project and issue type to proceed', async () => {
    const searchProjects = vi.fn().mockResolvedValue([
      {
        id: 'p1',
        key: 'ABC',
        name: 'Alpha',
        issueTypes: [
          {
            id: '1',
            name: 'Bug',
            iconUrl: '',
            description: '',
            subtask: false
          },
          {
            id: '2',
            name: 'Sub-task',
            iconUrl: '',
            description: '',
            subtask: true
          }
        ]
      }
    ])
    const getRecentProjects = vi.fn().mockResolvedValue([])

    vi.mocked(getProjectService).mockReturnValue({
      searchProjects,
      getRecentProjects,
      getFrequentProjects: vi.fn().mockResolvedValue([]),
      getProject: vi.fn(),
      recordProjectClick: vi.fn().mockResolvedValue(undefined)
    } as unknown as ReturnType<typeof getProjectService>)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/templates/new']}>
          <Routes>
            <Route path="/templates/new" element={<TemplateWizardPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const continueButton = screen.getByRole('button', { name: 'Next: Fields' })
    expect((continueButton as HTMLButtonElement).disabled).toBe(true)

    const projectInput = screen.getByPlaceholderText('Search projects…')

    await act(async () => {
      fireEvent.mouseDown(projectInput)
      fireEvent.change(projectInput, { target: { value: 'a' } })
      await new Promise((r) => setTimeout(r, 350))
    })

    await waitFor(() => {
      expect(searchProjects).toHaveBeenCalledWith('a')
    })

    const projectOption = await screen.findByText('ABC — Alpha')
    fireEvent.click(projectOption)

    const issueTypeInput = await screen.findByPlaceholderText(
      'Search issue types…'
    )

    // Clicking the input should show recommendations (async loaded)
    await act(async () => {
      fireEvent.mouseDown(issueTypeInput)
    })

    const issueTypeOption = await screen.findByText('Bug')
    expect(screen.queryByText('Sub-task')).toBeNull()

    await act(async () => {
      fireEvent.mouseDown(issueTypeOption)
      fireEvent.click(issueTypeOption)
    })

    await waitFor(() => {
      expect((continueButton as HTMLButtonElement).disabled).toBe(false)
    })
  }, 10000)
})
