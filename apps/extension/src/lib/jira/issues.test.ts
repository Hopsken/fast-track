import { Version3Client } from 'jira.js'
import { describe, it, expect, vi } from 'vitest'

import { JiraIssueService } from './issues'

// Create a mock client factory
function createMockClient() {
  return {
    issueSearch: {
      searchForIssuesUsingJqlEnhancedSearchPost: vi
        .fn()
        .mockResolvedValue({ issues: [] })
    }
  } as unknown as Version3Client
}

describe('JiraIssueService searchIssuesByText', () => {
  it('should generate project-scoped numeric search OR project-scoped summary search', async () => {
    const mockClient = createMockClient()
    const getClient = vi.fn().mockResolvedValue(mockClient)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const searchSpy = vi.spyOn(
      mockClient.issueSearch,
      'searchForIssuesUsingJqlEnhancedSearchPost'
    )

    await service.searchIssuesByText('123', { projectKeys: ['PROJ'] })

    // Expected JQL: (project in ("PROJ") AND (summary ~ "123*" OR summary ~ "*123" OR issuekey ~ "-123"))
    expect(searchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        jql: expect.stringMatching(
          /\(project in \("PROJ"\) AND \(summary ~ "123\*" OR summary ~ "\*123" OR issuekey ~ "-123"\)\)/
        )
      })
    )
  })

  it('should generate global exact key search', async () => {
    const mockClient = createMockClient()
    const getClient = vi.fn().mockResolvedValue(mockClient)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const searchSpy = vi.spyOn(
      mockClient.issueSearch,
      'searchForIssuesUsingJqlEnhancedSearchPost'
    )

    await service.searchIssuesByText('PROJ-123', { projectKeys: ['PROJ'] })

    // Expected JQL: ((project in ("PROJ") AND (summary ...)) OR (issuekey = "PROJ-123"))

    expect(searchSpy).toHaveBeenCalled()
    const callArgs = searchSpy.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    expect(jql).toContain('project in ("PROJ")')
    expect(jql).toContain('issuekey = "PROJ-123"')
    expect(jql).toContain(' OR (issuekey = "PROJ-123")')
  })

  it('should handle mixed tokens', async () => {
    const mockClient = createMockClient()
    const getClient = vi.fn().mockResolvedValue(mockClient)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const searchSpy = vi.spyOn(
      mockClient.issueSearch,
      'searchForIssuesUsingJqlEnhancedSearchPost'
    )

    await service.searchIssuesByText('foo 123', { projectKeys: ['PROJ'] })

    expect(searchSpy).toHaveBeenCalled()
    const callArgs = searchSpy.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    // Structure: (project IN (...) AND ((summary ...) OR (numeric ...)))

    expect(jql).toContain('summary ~ "foo*"')
    expect(jql).toContain('issuekey ~ "-123"')

    expect(jql).toMatch(
      /\(project in \("PROJ"\) AND \(summary ~ .* OR issuekey ~ "-123"\)\)/
    )
  })

  it('should handle search without project keys', async () => {
    const mockClient = createMockClient()
    const getClient = vi.fn().mockResolvedValue(mockClient)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const searchSpy = vi.spyOn(
      mockClient.issueSearch,
      'searchForIssuesUsingJqlEnhancedSearchPost'
    )

    await service.searchIssuesByText('123', { projectKeys: [] })

    expect(searchSpy).toHaveBeenCalled()
    const callArgs = searchSpy.mock.calls[0]?.[0]
    const jql = callArgs?.jql

    // Structure: ((summary ~ ... OR issuekey ~ ...))
    expect(jql).not.toContain('project in')
    expect(jql).toContain('issuekey ~ "-123"')
  })
})

describe('JiraIssueService getMySuggestedIssues', () => {
  it('should generate assignee + in progress or open sprint JQL', async () => {
    const mockClient = createMockClient()
    const getClient = vi.fn().mockResolvedValue(mockClient)
    const getWebBaseUrl = vi.fn().mockReturnValue('')
    const service = new JiraIssueService(getClient, getWebBaseUrl)

    const searchSpy = vi.spyOn(
      mockClient.issueSearch,
      'searchForIssuesUsingJqlEnhancedSearchPost'
    )

    await service.getMySuggestedIssues(25)

    expect(searchSpy).toHaveBeenCalled()
    const callArgs = searchSpy.mock.calls[0]?.[0]
    const jql = callArgs?.jql ?? ''

    expect(jql).toContain('assignee = currentUser()')
    expect(jql).toContain(
      '(statusCategory = "In Progress" OR sprint in openSprints())'
    )
    expect(jql).toContain('ORDER BY updated DESC')
    expect(callArgs?.maxResults).toBe(25)
  })
})
