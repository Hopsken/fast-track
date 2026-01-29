import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProjectServiceImpl } from './index'

const projectsMock = {
  listProjects: vi.fn(),
  searchProjects: vi.fn(),
  getProjectIssueTypes: vi.fn()
}

vi.mock('~/lib/jira', () => {
  return {
    getJiraApi: () => ({
      projects: projectsMock
    })
  }
})

describe('ProjectServiceImpl (jira project service)', () => {
  beforeEach(() => {
    projectsMock.listProjects.mockReset()
    projectsMock.searchProjects.mockReset()
    projectsMock.getProjectIssueTypes.mockReset()
  })

  it('searchProjects passes query and returns {key,name}', async () => {
    projectsMock.searchProjects.mockResolvedValueOnce({
      values: [
        { key: 'ABC', name: 'Alpha' },
        { key: 'ABCD', name: 'Alpha 2' }
      ]
    })

    const svc = new ProjectServiceImpl()
    const res = await svc.searchProjects('alp')

    expect(res).toEqual([
      { key: 'ABC', name: 'Alpha' },
      { key: 'ABCD', name: 'Alpha 2' }
    ])

    expect(projectsMock.searchProjects).toHaveBeenCalledWith(
      'alp',
      expect.objectContaining({ maxResults: 7 })
    )
  })

  it('getProjectIssueTypes maps to {id,name}', async () => {
    projectsMock.getProjectIssueTypes.mockResolvedValueOnce([
      { id: '1', name: 'Bug' },
      { id: '2', name: 'Task' }
    ])

    const svc = new ProjectServiceImpl()
    const issueTypes = await svc.getProjectIssueTypes('PROJ')

    expect(issueTypes).toEqual([
      { id: '1', name: 'Bug' },
      { id: '2', name: 'Task' }
    ])
  })

  it('propagates Jira API errors', async () => {
    projectsMock.searchProjects.mockRejectedValueOnce(new Error('boom'))

    const svc = new ProjectServiceImpl()
    await expect(svc.searchProjects('x')).rejects.toThrow('boom')
  })
})
