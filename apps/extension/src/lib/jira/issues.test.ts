import { Version3Client } from 'jira.js'
import type { Issue } from 'jira.js/version3/models/issue'
import { describe, it, expect, vi } from 'vitest'

import { JiraIssueService } from './issues'

// Create a mock client factory
function createMockClient() {
  const searchMock = vi.fn().mockResolvedValue({ issues: [] })

  return {
    client: {
      issueSearch: {
        searchForIssuesUsingJqlEnhancedSearchPost: searchMock
      }
    } as unknown as Version3Client,
    searchMock
  }
}

describe('JiraIssueService searchIssuesByText', () => {
  it('should generate project-scoped numeric search OR project-scoped summary search', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    await service.searchIssuesByText('123', { projectKeys: ['PROJ'] })

    // Expected JQL: (project in ("PROJ") AND (summary ~ "123*" OR summary ~ "*123" OR issuekey ~ "-123"))
    expect(searchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jql: expect.stringMatching(
          /\(project in \("PROJ"\) AND \(summary ~ "123\*" OR summary ~ "\*123" OR issuekey ~ "-123"\)\)/
        )
      })
    )
  })

  it('should generate global exact key search', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    await service.searchIssuesByText('PROJ-123', { projectKeys: ['PROJ'] })

    // Expected JQL: ((project in ("PROJ") AND (summary ...)) OR (issuekey = "PROJ-123"))

    expect(searchMock).toHaveBeenCalled()
    const callArgs = searchMock.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    expect(jql).toContain('project in ("PROJ")')
    expect(jql).toContain('issuekey = "PROJ-123"')
    expect(jql).toContain(' OR (issuekey = "PROJ-123")')
  })

  it('should handle mixed tokens', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    await service.searchIssuesByText('foo 123', { projectKeys: ['PROJ'] })

    expect(searchMock).toHaveBeenCalled()
    const callArgs = searchMock.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    // Structure: (project IN (...) AND ((summary ...) OR (numeric ...)))

    expect(jql).toContain('summary ~ "foo*"')
    expect(jql).toContain('issuekey ~ "-123"')

    expect(jql).toMatch(
      /\(project in \("PROJ"\) AND \(summary ~ .* OR issuekey ~ "-123"\)\)/
    )
  })

  it('should handle search without project keys', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    await service.searchIssuesByText('123', { projectKeys: [] })

    expect(searchMock).toHaveBeenCalled()
    const callArgs = searchMock.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    // Structure: ((summary ~ ... OR issuekey ~ ...))
    expect(jql).not.toContain('project in')
    expect(jql).toContain('issuekey ~ "-123"')
  })
})

describe('JiraIssueService getMySuggestedIssues', () => {
  it('should generate separate in-progress and open sprint JQL', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    await service.getMySuggestedIssues(25)

    expect(searchMock).toHaveBeenCalledTimes(2)
    const callArgs = searchMock.mock.calls.map((call) => call[0])
    const jqls = callArgs.map((args) => args?.jql ?? '')

    expect(jqls.join(' ')).toContain('assignee = currentUser()')
    expect(
      jqls.some((jql) => jql.includes('statusCategory = "In Progress"'))
    ).toBe(true)
    expect(jqls.some((jql) => jql.includes('sprint in openSprints()'))).toBe(
      true
    )
    expect(jqls.every((jql) => jql.includes('ORDER BY updated DESC'))).toBe(
      true
    )
    expect(callArgs.every((args) => args?.maxResults === 25)).toBe(true)
  })

  it('should return in-progress tickets when sprint query fails', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const inProgressIssue = {
      id: '1',
      key: 'PROJ-1',
      fields: {
        summary: 'In progress ticket',
        issuetype: {
          name: 'Task',
          iconUrl: '',
          description: ''
        },
        status: {
          id: '10',
          name: 'In Progress',
          description: '',
          statusCategory: {
            key: 'indeterminate',
            colorName: '',
            name: ''
          }
        },
        assignee: null,
        priority: null,
        project: {
          key: 'PROJ',
          name: 'Project'
        },
        created: '',
        updated: ''
      }
    } as unknown as Issue

    searchMock
      .mockResolvedValueOnce({ issues: [inProgressIssue] })
      .mockRejectedValueOnce(new Error('Open sprints not available'))

    const results = await service.getMySuggestedIssues(25)

    expect(results).toHaveLength(1)
    expect(results[0]?.key).toBe('PROJ-1')
  })

  it('should order tickets by updated across sources before applying the limit', async () => {
    const { client, searchMock } = createMockClient()
    const getClient = vi.fn().mockResolvedValue(client)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const inProgressIssue = {
      id: '1',
      key: 'PROJ-1',
      fields: {
        summary: 'Older in progress ticket',
        issuetype: {
          name: 'Task',
          iconUrl: '',
          description: ''
        },
        status: {
          id: '10',
          name: 'In Progress',
          description: '',
          statusCategory: {
            key: 'indeterminate',
            colorName: '',
            name: ''
          }
        },
        assignee: null,
        priority: null,
        project: {
          key: 'PROJ',
          name: 'Project'
        },
        created: '2024-01-01T00:00:00.000Z',
        updated: '2024-01-02T00:00:00.000Z'
      }
    } as unknown as Issue

    const sprintIssue = {
      id: '2',
      key: 'PROJ-2',
      fields: {
        summary: 'Newer sprint ticket',
        issuetype: {
          name: 'Task',
          iconUrl: '',
          description: ''
        },
        status: {
          id: '11',
          name: 'To Do',
          description: '',
          statusCategory: {
            key: 'new',
            colorName: '',
            name: ''
          }
        },
        assignee: null,
        priority: null,
        project: {
          key: 'PROJ',
          name: 'Project'
        },
        created: '2024-02-01T00:00:00.000Z',
        updated: '2024-02-02T00:00:00.000Z'
      }
    } as unknown as Issue

    searchMock
      .mockResolvedValueOnce({ issues: [inProgressIssue] })
      .mockResolvedValueOnce({ issues: [sprintIssue] })

    const results = await service.getMySuggestedIssues(1)

    expect(results).toHaveLength(1)
    expect(results[0]?.key).toBe('PROJ-2')
  })
})
