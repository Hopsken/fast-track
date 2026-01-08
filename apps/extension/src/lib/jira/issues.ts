/**
 * Jira Issue Service
 * Handles issue fetching, bulk operations, and ticket conversion
 */

import type { Issue } from 'jira.js/version3/models/issue'
import type { IssuePickerSuggestions } from 'jira.js/version3/models/issuePickerSuggestions'
import { chunk, compact, flatMap, map } from 'lodash-es'

import {
  IssueDetail,
  IssueSource,
  JiraMergeRequest,
  JiraPriority,
  JiraTicket,
  JiraTransition
} from '@/types'
import { isNonNullable } from '@/utils/assert'
import { isTicketKey, mapPriority, mapTransition } from '@/utils/jira/issues'
import { extractMergeRequestsFromRemoteLinks } from '@/utils/jira/merge-requests'
import { normalizeProjects } from '@/utils/ticket-search'
import { getLogger } from '~/utils/logger'

import { toISODateString } from '../date'

import type { JiraClient } from './client'

const issueFields = [
  'id',
  'key',
  'summary',
  'issuetype',
  'status',
  'assignee',
  'priority',
  'project',
  'created',
  'updated',
  'lastViewed'
]

// remove double quotes and backslashes from JQL value
const normalizeJqlValue = (value: string) => value.replace(/["\\]/g, '')
const log = getLogger('jira-issues')

/**
 * Service for issue-related operations with functional programming patterns
 */
export class JiraIssueService {
  private rateLimitDelay = 100 // ms between requests

  constructor(private client: JiraClient) {}

  /**
   * Fetches a single issue by key
   */
  async getIssue(issueKey: string): Promise<JiraTicket | null> {
    try {
      log.info(`🎫 JiraAPI: Fetching issue ${issueKey}`)

      const issue = await this.client.issues.getIssue({
        issueIdOrKey: issueKey,
        fields: issueFields
      })

      log.info(`✅ JiraAPI: Successfully fetched issue ${issueKey}`)
      return this.convertToTicket(issue)
    } catch (error) {
      log.error(`❌ JiraAPI: Failed to fetch issue ${issueKey}:`, error)
      return null
    }
  }

  async assignIssue(issueKey: string, accountId: string | null) {
    await this.client.issues.assignIssue({
      issueIdOrKey: issueKey,
      accountId
    })
  }

  async getPriorities(): Promise<JiraPriority[]> {
    const priorities = await this.client.issuePriorities.getPriorities()
    return (priorities || [])
      .map((priority) => mapPriority(priority))
      .filter((priority): priority is JiraPriority => !!priority.id)
  }

  async getIssueTransitions(issue: JiraTicket): Promise<JiraTransition[]> {
    const transitions = await this.client.issues.getTransitions({
      issueIdOrKey: issue.key,
      sortByOpsBarAndStatus: true
    })

    return (
      transitions.transitions?.map(mapTransition).filter(isNonNullable) ?? []
    )
  }

  async transitionIssue(issueKey: string, transitionId: string) {
    await this.client.issues.doTransition({
      issueIdOrKey: issueKey,
      transition: { id: transitionId }
    })

    return this.getIssue(issueKey)
  }

  async updateIssuePriority(issueKey: string, priorityId: string) {
    await this.client.issues.editIssue({
      issueIdOrKey: issueKey,
      fields: {
        priority: { id: priorityId }
      }
    })

    return this.getIssue(issueKey)
  }

  /**
   * Fetches suggested issues from Jira Issue Picker API and returns full tickets
   * When query is omitted or empty, Jira returns personalized suggestions.
   */
  async getIssuePickerSuggestions(query?: string): Promise<JiraTicket[]> {
    try {
      log.info('🎯 JiraAPI: Fetching issue picker suggestions...', {
        hasQuery: !!query
      })

      // Use jira.js Issue Search API for Issue Picker
      const response: IssuePickerSuggestions =
        await this.client.issueSearch.getIssuePickerResource(
          query && query.trim() ? { query } : {}
        )

      // Response shape: { sections: [{ issues: [{ key, summary, ...}] } ...] }
      const sections: NonNullable<IssuePickerSuggestions['sections']> =
        Array.isArray(response?.sections) ? (response.sections ?? []) : []

      const issueKeys = Array.from(
        new Set(
          sections.flatMap((sec) =>
            Array.isArray(sec?.issues)
              ? sec.issues
                  .map((i) => i?.key)
                  .filter((k): k is string => typeof k === 'string')
              : []
          )
        )
      ) as string[]

      if (issueKeys.length === 0) {
        log.info('ℹ️ JiraAPI: No issue picker suggestions found')
        return []
      }

      // Reuse bulk issue fetch to get full ticket details
      const tickets = await this.getIssues(issueKeys)
      log.info(
        `✅ JiraAPI: Retrieved ${tickets.length}/${issueKeys.length} suggested tickets`
      )
      return tickets
    } catch (error) {
      log.error('❌ JiraAPI: Failed to fetch issue picker suggestions:', error)
      return []
    }
  }

  async searchIssuesByText(
    query: string,
    options?: { limit?: number; projectKeys?: string[] }
  ): Promise<JiraTicket[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return []
    }

    const maxResults = options?.limit ?? 30
    const projectKeys = normalizeProjects(options?.projectKeys ?? [])

    const tokens = trimmedQuery.split(/\s+/).filter(Boolean)

    const clauses = new Set<string>()
    const exactKeyClauses = new Set<string>()

    tokens.forEach((token) => {
      const escapedValue = normalizeJqlValue(token)
      clauses.add(`summary ~ "${escapedValue}*"`)
      clauses.add(`summary ~ "*${escapedValue}"`)

      if (/^\d+$/.test(token)) {
        clauses.add(`issuekey ~ "-${token}"`)
      }
    })

    const keyLike = isTicketKey(trimmedQuery)
    if (keyLike) {
      exactKeyClauses.add(`issuekey = "${trimmedQuery.toUpperCase()}"`)
    }

    // (summary ~ ... OR issuekey ~ ...)
    const scopedJql =
      clauses.size > 0 ? `(${Array.from(clauses).join(' OR ')})` : ''

    const exactKeyJql =
      exactKeyClauses.size > 0
        ? `(${Array.from(exactKeyClauses).join(' OR ')})`
        : ''

    const projectClause =
      projectKeys.length > 0
        ? `project in (${projectKeys
            .map((key) => `"${normalizeJqlValue(key)}"`)
            .join(', ')})`
        : ''

    // (project IN (...) AND (summary ~ ... OR issuekey ~ ...)) OR (issuekey = ...)
    const textSearchPart = [projectClause, scopedJql]
      .filter(Boolean)
      .join(' AND ')

    const jqlParts = [textSearchPart ? `(${textSearchPart})` : '', exactKeyJql]
      .filter(Boolean)
      .join(' OR ')

    const jql = `${jqlParts} ORDER BY updated DESC`
    return this.searchIssuesUsingJql(jql, { limit: maxResults })
  }

  private async searchIssuesUsingJql(
    jql: string,
    options?: {
      source?: IssueSource
      limit?: number
    }
  ): Promise<JiraTicket[]> {
    const { source, limit = 30 } = options ?? {}
    const response =
      await this.client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql,
        fields: issueFields,
        maxResults: limit
      })

    return (
      response.issues?.map((issue) => this.convertToTicket(issue, source)) ?? []
    )
  }

  async getMyRecentDoneIssues(limit = 5): Promise<JiraTicket[]> {
    return this.searchIssuesUsingJql(
      'assignee = currentUser() AND statusCategory = Done AND resolved >= -14d ORDER BY resolved DESC',
      { limit }
    )
  }

  async getMyWatchingIssues(limit = 5): Promise<JiraTicket[]> {
    return this.searchIssuesUsingJql(
      'watcher = currentUser() ORDER BY updated DESC',
      { source: 'watching', limit }
    )
  }

  async getMyUnresolvedIssues(limit = 20): Promise<JiraTicket[]> {
    return this.searchIssuesUsingJql(
      'assignee = currentUser() AND statusCategory = "In Progress" ORDER BY updated DESC',
      { limit }
    )
  }

  async getMyActiveSprintTodoIssues(limit = 20): Promise<JiraTicket[]> {
    const jql = [
      'sprint in openSprints()',
      'assignee = currentUser()',
      'statusCategory = "To Do"'
    ].join(' AND ')

    return this.searchIssuesUsingJql(`${jql} ORDER BY updated DESC`, {
      source: 'sprint',
      limit
    })
  }

  async getRecentHistoryIssues(limit = 10): Promise<JiraTicket[]> {
    return this.searchIssuesUsingJql(
      'issue in issueHistory() ORDER BY lastViewed DESC, updated DESC',
      { source: 'history', limit }
    )
  }

  /**
   * Fetches multiple issues using bulk API with functional patterns
   */
  async getIssues(issueKeys: string[]): Promise<JiraTicket[]> {
    log.info(`🎫 JiraAPI: Bulk fetching ${issueKeys.length} issues:`, issueKeys)

    const batchSize = 100 // jira.js bulkFetchIssues limit
    const batches = chunk(issueKeys, batchSize)

    const tasks = batches.map((batch) => this.processBulkBatch(batch))

    const batchResults = await Promise.all(tasks)

    const tickets = flatMap(batchResults)

    log.info(
      `✅ JiraAPI: Bulk fetch completed. Successfully fetched ${tickets.length}/${issueKeys.length} issues`
    )
    return tickets
  }

  /**
   * Processes a bulk batch of issue keys using jira.js bulkFetchIssues
   */
  private async processBulkBatch(batch: string[]): Promise<JiraTicket[]> {
    try {
      // Use bulk fetch API to get multiple issues at once
      const searchResult = await this.client.issues.bulkFetchIssues({
        issueIdsOrKeys: batch,
        fields: issueFields
      })

      const tickets = compact(
        map(searchResult.issues || [], (issue) => {
          try {
            return this.convertToTicket(issue)
          } catch (error) {
            log.warn(`⚠️ JiraAPI: Failed to convert issue ${issue.key}:`, error)
            return null // Will be removed by compact()
          }
        })
      )

      // Log any issues that weren't found
      const foundKeys = new Set(tickets.map((t) => t.key))
      const missingKeys = batch.filter((key) => !foundKeys.has(key))
      if (missingKeys.length > 0) {
        log.warn(`⚠️ JiraAPI: Issues not found: ${missingKeys.join(', ')}`)
      }

      return tickets
    } catch (error) {
      log.error(`❌ JiraAPI: Bulk fetch failed for batch:`, error)

      return []
    }
  }

  /**
   * Converts a jira.js Issue to internal ticket format
   */
  private convertToTicket(issue: Issue, source?: IssueSource): JiraTicket {
    const browseBaseUrl = this.client.getWebBaseUrl()
    const jiraWebUrl = browseBaseUrl
      ? `${browseBaseUrl}/browse/${issue.key}`
      : (issue.self ?? '')

    const statusName = issue.fields?.status?.name?.toLowerCase?.() || ''
    const statusKey =
      issue.fields?.status?.statusCategory?.key?.toLowerCase?.() || ''
    const isInProgress =
      statusName.includes('in progress') || statusKey === 'indeterminate'

    return {
      id: String(issue.id),
      key: issue.key,
      summary: issue.fields?.summary || '',
      issueType: {
        name: issue.fields?.issuetype?.name || '',
        iconUrl: issue.fields?.issuetype?.iconUrl || '',
        description: issue.fields?.issuetype?.description || ''
      },
      status: {
        id: issue.fields?.status?.id || '',
        name: issue.fields?.status?.name || '',
        description: issue.fields?.status?.description || '',
        statusCategory: {
          key: issue.fields?.status?.statusCategory?.key || '',
          colorName: issue.fields?.status?.statusCategory?.colorName || '',
          name: issue.fields?.status?.statusCategory?.name || ''
        }
      },
      assignee: issue.fields?.assignee
        ? {
            displayName: issue.fields.assignee.displayName || '',
            emailAddress: issue.fields.assignee.emailAddress || '',
            avatarUrls: issue.fields.assignee.avatarUrls?.['48x48'] || ''
          }
        : null,
      priority: issue.fields?.priority
        ? mapPriority(issue.fields.priority)
        : null,
      projectKey: issue.fields?.project?.key || '',
      boardName: issue.fields?.project?.name || '',
      url: jiraWebUrl,
      isInProgress,
      sources: source ? [source] : [],
      lastViewed: issue.fields.lastViewed
        ? toISODateString(issue.fields.lastViewed)
        : null,
      created: issue.fields.created
        ? toISODateString(issue.fields.created)
        : '',
      updated: issue.fields.updated ? toISODateString(issue.fields.updated) : ''
    }
  }

  /**
   * Fetches a single issue with full details for detail view
   */
  async getIssueDetail(issueKey: string): Promise<IssueDetail | null> {
    try {
      log.info(`🎫 JiraAPI: Fetching issue detail ${issueKey}`)

      const issue = await this.client.issues.getIssue({
        issueIdOrKey: issueKey,
        fields: [
          'summary',
          'description',
          'status',
          'priority',
          'issuetype',
          'project',
          'assignee',
          'reporter',
          'labels',
          'components',
          'parent',
          'subtasks',
          'duedate'
        ],
        expand: 'renderedFields'
      })

      log.info(`✅ JiraAPI: Successfully fetched issue detail ${issueKey}`)
      return this.convertToIssueDetail(issue)
    } catch (error) {
      log.error(`❌ JiraAPI: Failed to fetch issue detail ${issueKey}:`, error)
      return null
    }
  }

  async getIssueMergeRequests(issueKey: string): Promise<JiraMergeRequest[]> {
    try {
      const links = await this.client.issueRemoteLinks.getRemoteIssueLinks({
        issueIdOrKey: issueKey
      })

      return extractMergeRequestsFromRemoteLinks(links ?? [])
    } catch (error) {
      log.error(
        `❌ JiraAPI: Failed to fetch remote links for ${issueKey}:`,
        error
      )
      return []
    }
  }

  private convertToIssueDetail(issue: Issue): IssueDetail {
    const ticket = this.convertToTicket(issue)

    const description =
      (issue.renderedFields as unknown as Record<string, string>)
        ?.description ??
      issue.fields?.description ??
      ''

    return {
      ...ticket,
      description: typeof description === 'string' ? description : '',
      reporter: issue.fields?.reporter
        ? {
            displayName: issue.fields.reporter.displayName ?? '',
            emailAddress: issue.fields.reporter.emailAddress ?? '',
            avatarUrls: issue.fields.reporter.avatarUrls?.['48x48'] ?? ''
          }
        : undefined,
      labels: issue.fields?.labels ?? [],
      components: (issue.fields?.components ?? []).map((c) => ({
        id: c.id ?? '',
        name: c.name ?? ''
      })),
      parent: issue.fields?.parent
        ? {
            key: issue.fields.parent.key ?? '',
            summary: issue.fields.parent.fields?.summary ?? ''
          }
        : undefined,
      subtasks: (issue.fields?.subtasks ?? []).map((t) => ({
        id: t.id ?? '',
        key: t.key ?? '',
        summary: t.fields?.summary ?? '',
        fields: {
          status: { name: t.fields?.status?.name ?? '' },
          priority: {
            name: t.fields?.priority?.name ?? '',
            iconUrl: t.fields?.priority?.iconUrl
          },
          issuetype: { iconUrl: t.fields?.issuetype?.iconUrl }
        }
      })),
      dueDate: issue.fields?.duedate ?? undefined,
      project: {
        key: issue.fields?.project?.key ?? '',
        name: issue.fields?.project?.name ?? '',
        avatarUrl: issue.fields?.project?.avatarUrls?.['48x48']
      }
    }
  }

  public getIssueEditMetadata(issue: JiraTicket) {
    return this.client.issues.getEditIssueMeta({
      issueIdOrKey: issue.key
    })
  }

  /**
   * Updates the rate limit delay
   */
  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = Math.max(0, delay)
  }

  /**
   * Gets the current rate limit delay
   */
  getRateLimitDelay(): number {
    return this.rateLimitDelay
  }
}
