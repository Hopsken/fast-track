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

  it('renders single-screen editor with scope and create button', async () => {
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

    // Single screen: inline name, scope selectors, and Create button all visible
    expect(screen.getByPlaceholderText('Template name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Add a description…')).toBeTruthy()
    expect(screen.getByPlaceholderText('Search projects…')).toBeTruthy()

    const createButton = screen.getByRole('button', { name: 'Create' })
    expect((createButton as HTMLButtonElement).disabled).toBe(true)

    // Select project
    const projectInput = screen.getByPlaceholderText('Search projects…')

    await act(async () => {
      fireEvent.mouseDown(projectInput)
      fireEvent.change(projectInput, { target: { value: 'a' } })
      await new Promise((r) => setTimeout(r, 350))
    })

    await waitFor(() => {
      expect(searchProjects).toHaveBeenCalledWith('a')
    })

    const projectOption = await screen.findByText('Alpha')
    fireEvent.click(projectOption)

    // Select issue type
    const issueTypeInput = await screen.findByPlaceholderText(
      'Search issue types…'
    )

    await act(async () => {
      fireEvent.mouseDown(issueTypeInput)
    })

    const issueTypeOption = await screen.findByText('Bug')
    expect(screen.queryByText('Sub-task')).toBeNull()

    await act(async () => {
      fireEvent.mouseDown(issueTypeOption)
      fireEvent.click(issueTypeOption)
    })

    // Create still disabled (no name yet)
    expect((createButton as HTMLButtonElement).disabled).toBe(true)

    // Type a name → Create becomes enabled
    const nameInput = screen.getByPlaceholderText('Template name')
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Bug report' } })
    })

    await waitFor(() => {
      expect((createButton as HTMLButtonElement).disabled).toBe(false)
    })
  }, 10000)
})
