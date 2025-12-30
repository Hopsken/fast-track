/**
 * Jira Issue Service
 * Handles issue fetching, bulk operations, and ticket conversion
 */

import type { Issue } from 'jira.js/version3/models/issue'
import type { IssuePickerSuggestions } from 'jira.js/version3/models/issuePickerSuggestions'
import { chunk, compact, flatMap, map } from 'lodash-es'

import { IssueSource, JiraPriority, JiraTicket, JiraTransition } from '@/types'
import { isNonNullable } from '@/utils/assert'
import { mapPriority, mapTransition } from '@/utils/jira/issues'
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

const escapeJqlValue = (value: string) => value.replace(/["\\]/g, '\\$&')
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
    maxResults = 30
  ): Promise<JiraTicket[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return []
    }

    const tokens = trimmedQuery.split(/\s+/).filter(Boolean)

    const clauses = new Set<string>()
    const addFieldClauses = (value: string) => {
      const escapedValue = escapeJqlValue(value)

      clauses.add(`summary ~ "${escapedValue}"`)
      clauses.add(`assignee = "${escapedValue}"`)
      // TODO: following fields are too vague to filter, may contain irrelevant issues, add until we can limit search to projects
      // clauses.add(`status ~ "${escapedValue}"`)
      // clauses.add(`issuetype ~ "${escapedValue}"`)
      // clauses.add(`priority ~ "${escapedValue}"`)
    }

    const keyLike = /^[A-Za-z][A-Za-z0-9]+-\d+$/.test(trimmedQuery)
    if (keyLike) {
      clauses.add(`issuekey = "${trimmedQuery.toUpperCase()}"`)
    }

    addFieldClauses(trimmedQuery)

    if (tokens.length > 1) {
      tokens.forEach((token) => addFieldClauses(token))
    }

    const jql = `${Array.from(clauses).join(' OR ')} ORDER BY updated DESC`
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
