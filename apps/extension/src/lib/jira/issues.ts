/**
 * Jira Issue Service
 * Handles issue fetching, bulk operations, and ticket conversion
 */

import { Version3Client } from 'jira.js'
import type { Issue } from 'jira.js/version3/models/issue'
import type { GetIssuePickerResource } from 'jira.js/version3/parameters/getIssuePickerResource'
import { chunk, compact, flatMap, map, orderBy, uniqBy } from 'lodash-es'

import type {
  CreateIssuePayload,
  FieldMetadata,
  IssueSource,
  JiraIssue,
  JiraIssueDetail,
  JiraMergeRequest,
  JiraPriority,
  JiraTransition,
  JiraUser
} from '@/repository/schema'
import { isNonNullable } from '@/utils/assert'
import { isTicketKey, mapPriority, mapTransition } from '@/utils/jira/issues'
import { extractMergeRequestsFromRemoteLinks } from '@/utils/jira/merge-requests'
import { normalizeProjects } from '@/utils/ticket-search'
import { getLogger } from '~/utils/logger'

import { toISODateString } from '../date'

import { parseCreateMetaFields, isValidCreateMetaFields } from './create-meta'

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

type ClientGetter = () => Promise<Version3Client>

/**
 * Service for issue-related operations.
 * Uses getter functions to lazily obtain the client, enabling transparent auth refresh.
 */
export class JiraIssueService {
  constructor(private getClient: ClientGetter) {}

  /**
   * Fetches a single issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    log.info(`🎫 JiraAPI: Fetching issue ${issueKey}`)

    const client = await this.getClient()
    const issue = await client.issues.getIssue({
      issueIdOrKey: issueKey,
      fields: issueFields
    })

    log.info(`✅ JiraAPI: Successfully fetched issue ${issueKey}`)
    return this.convertToTicket(issue)
  }

  /**
   * Fetch issue create meta for a given project + issue type.
   *
   * We intentionally return the raw response shape so higher-level modules
   * (e.g. template-service) can parse/validate and map it to their own types.
   */
  async getCreateIssueMetaFields(input: {
    projectIdOrKey: string
    issueTypeId: string
  }): Promise<FieldMetadata[]> {
    const client = await this.getClient()

    const page = await client.issues.getCreateIssueMetaIssueTypeId({
      projectIdOrKey: input.projectIdOrKey,
      issueTypeId: input.issueTypeId
    })
    const fields = parseCreateMetaFields(page)
    if (!isValidCreateMetaFields(fields)) return []
    return fields
  }

  async createIssue(input: CreateIssuePayload): Promise<{ key: string }> {
    const client = await this.getClient()
    return client.issues.createIssue({
      fields: {
        project: {
          key: input.projectKey
        },
        issuetype: {
          id: input.issueTypeId
        },
        ...input.fields
      }
    })
  }

  async assignIssue(issueKey: string, accountId: string | null) {
    const client = await this.getClient()
    await client.issues.assignIssue({
      issueIdOrKey: issueKey,
      accountId
    })

    return this.getIssue(issueKey)
  }

  async getPriorities(): Promise<JiraPriority[]> {
    const client = await this.getClient()
    const priorities = await client.issuePriorities.getPriorities()
    return (priorities || [])
      .map((priority) => mapPriority(priority))
      .filter((priority): priority is JiraPriority => !!priority.id)
  }

  async getIssueTransitions(issue: JiraIssue): Promise<JiraTransition[]> {
    const client = await this.getClient()
    const transitions = await client.issues.getTransitions({
      issueIdOrKey: issue.key,
      sortByOpsBarAndStatus: true
    })

    return (
      transitions.transitions?.map(mapTransition).filter(isNonNullable) ?? []
    )
  }

  async transitionIssue(
    issueKey: string,
    transition: JiraTransition,
    options?: {
      autoAssign?: {
        assignee: Pick<JiraUser, 'accountId'>
      }
    }
  ): Promise<JiraIssue> {
    const client = await this.getClient()

    await client.issues.doTransition({
      issueIdOrKey: issueKey,
      transition: { id: transition.id }
    })

    const { assignee: { accountId } = {} } = options?.autoAssign || {}

    if (accountId) {
      return this.assignIssue(issueKey, accountId)
    }

    return this.getIssue(issueKey)
  }

  async updateIssuePriority(
    issueKey: string,
    priority: JiraPriority
  ): Promise<JiraIssue> {
    const normalizedPriority = mapPriority(priority)
    const { id: priorityId } = normalizedPriority
    if (!priorityId) {
      throw new Error('updateTicketPriority: priority id is required')
    }

    const client = await this.getClient()
    await client.issues.editIssue({
      issueIdOrKey: issueKey,
      fields: {
        priority: { id: priorityId }
      }
    })

    return this.getIssue(issueKey)
  }

  async searchIssuesByText(
    query: string,
    options?: { limit?: number; projectKeys?: string[] }
  ): Promise<JiraIssue[]> {
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
    const issues = await this.searchIssuesUsingJql(jql, { limit: maxResults })
    return uniqBy(issues, 'key')
  }

  private searchIssuesUsingJql = async (
    jql: string,
    options?: {
      source?: IssueSource
      limit?: number
    }
  ): Promise<JiraIssue[]> => {
    const { source, limit = 30 } = options ?? {}
    const client = await this.getClient()
    const response =
      await client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql,
        fields: issueFields,
        maxResults: limit
      })

    return (
      response.issues?.map((issue) => this.convertToTicket(issue, source)) ?? []
    )
  }

  /**
   * Fetches suggested issues for the current user.
   * Fetches in-progress and open sprint issues separately to improve resilience
   * when openSprints() isn't available.
   */
  async getMySuggestedIssues(limit = 50): Promise<JiraIssue[]> {
    const assigneeClause = 'assignee = currentUser()'
    const inProgressJql = `${assigneeClause} AND statusCategory = "In Progress"`
    const openSprintJql = `${assigneeClause} AND sprint in openSprints()`

    const results = await Promise.allSettled([
      this.searchIssuesUsingJql(`${inProgressJql} ORDER BY updated DESC`, {
        limit
      }),
      this.searchIssuesUsingJql(`${openSprintJql} ORDER BY updated DESC`, {
        limit
      })
    ])

    const [inProgressResult, sprintResult] = results

    if (inProgressResult.status === 'rejected') {
      log.warn(
        'getMySuggestedIssues: in-progress query failed',
        inProgressResult.reason
      )
    }

    if (sprintResult.status === 'rejected') {
      log.warn(
        'getMySuggestedIssues: open sprint query failed, continuing with available results',
        sprintResult.reason
      )
    }

    const tickets = flatMap(
      results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : []
      )
    )

    if (tickets.length === 0) {
      const rejectedResults = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )

      if (rejectedResults.length === results.length) {
        throw rejectedResults[0]?.reason
      }

      return []
    }

    const uniqueTickets = orderBy(uniqBy(tickets, 'key'), 'updated', 'desc')

    return uniqueTickets.slice(0, limit)
  }

  async getRecentHistoryIssues(limit = 10): Promise<JiraIssue[]> {
    return this.searchIssuesUsingJql(
      'issue in issueHistory() ORDER BY lastViewed DESC, updated DESC',
      { source: 'history', limit }
    )
  }

  async getIssuePickerSuggestions(params: GetIssuePickerResource) {
    const client = await this.getClient()
    const result = await client.issueSearch.getIssuePickerResource(params)

    return flatMap(result.sections, (section) => section.issues)
  }

  /**
   * Fetches multiple issues using bulk API with functional patterns
   */
  async getIssues(issueKeys: string[]): Promise<JiraIssue[]> {
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
  private async processBulkBatch(batch: string[]): Promise<JiraIssue[]> {
    try {
      const client = await this.getClient()
      // Use bulk fetch API to get multiple issues at once
      const searchResult = await client.issues.bulkFetchIssues({
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
  private convertToTicket(issue: Issue, source?: IssueSource): JiraIssue {
    const statusName = issue.fields?.status?.name?.toLowerCase?.() || ''
    const statusKey =
      issue.fields?.status?.statusCategory?.key?.toLowerCase?.() || ''
    const isInProgress =
      statusName.includes('in progress') || statusKey === 'indeterminate'

    return {
      __typename: 'JiraTicket',
      id: String(issue.id),
      key: issue.key,
      summary: issue.fields?.summary || '',
      issueType: {
        id: issue.fields?.issuetype?.id || '',
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
      url: issue.self ?? '',
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
  async getIssueDetail(issueKey: string): Promise<JiraIssueDetail> {
    log.info(`🎫 JiraAPI: Fetching issue detail ${issueKey}`)

    const client = await this.getClient()
    const issue = await client.issues.getIssue({
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
  }

  async getIssueMergeRequests(issueKey: string): Promise<JiraMergeRequest[]> {
    try {
      const client = await this.getClient()
      const links = await client.issueRemoteLinks.getRemoteIssueLinks({
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

  private convertToIssueDetail(issue: Issue): JiraIssueDetail {
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
        id: issue.fields?.project?.id ?? '',
        key: issue.fields?.project?.key ?? '',
        name: issue.fields?.project?.name ?? '',
        avatarUrl: issue.fields?.project?.avatarUrls?.['48x48']
      }
    }
  }

  public async getIssueEditMetadata(ticketKey: string) {
    const client = await this.getClient()
    return client.issues.getEditIssueMeta({
      issueIdOrKey: ticketKey
    })
  }
}
