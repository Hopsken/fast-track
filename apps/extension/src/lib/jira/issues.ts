/**
 * Jira Issue Service
 * Handles issue fetching, bulk operations, and ticket conversion
 */

import type { Issue } from 'jira.js/version3/models/issue'
import type { IssuePickerSuggestions } from 'jira.js/version3/models/issuePickerSuggestions'
import { chunk, compact, flatMap, map } from 'lodash-es'

import { JiraTicket } from '@/types'

import type { JiraClient } from './client'

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
      console.log(`🎫 JiraAPI: Fetching issue ${issueKey}`)

      const issue = await this.client.issues.getIssue({
        issueIdOrKey: issueKey,
        fields: [
          'id',
          'key',
          'summary',
          'issuetype',
          'status',
          'assignee',
          'priority',
          'project'
        ]
      })

      console.log(`✅ JiraAPI: Successfully fetched issue ${issueKey}`)
      return this.convertToTicket(issue)
    } catch (error) {
      console.error(`❌ JiraAPI: Failed to fetch issue ${issueKey}:`, error)
      return null
    }
  }

  /**
   * Fetches suggested issues from Jira Issue Picker API and returns full tickets
   * When query is omitted or empty, Jira returns personalized suggestions.
   */
  async getIssuePickerSuggestions(query?: string): Promise<JiraTicket[]> {
    try {
      console.log('🎯 JiraAPI: Fetching issue picker suggestions...', {
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
        console.log('ℹ️ JiraAPI: No issue picker suggestions found')
        return []
      }

      // Reuse bulk issue fetch to get full ticket details
      const tickets = await this.getIssues(issueKeys)
      console.log(
        `✅ JiraAPI: Retrieved ${tickets.length}/${issueKeys.length} suggested tickets`
      )
      return tickets
    } catch (error) {
      console.error(
        '❌ JiraAPI: Failed to fetch issue picker suggestions:',
        error
      )
      return []
    }
  }

  /**
   * Fetches multiple issues using bulk API with functional patterns
   */
  async getIssues(issueKeys: string[]): Promise<JiraTicket[]> {
    console.log(
      `🎫 JiraAPI: Bulk fetching ${issueKeys.length} issues:`,
      issueKeys
    )

    const batchSize = 100 // jira.js bulkFetchIssues limit
    const batches = chunk(issueKeys, batchSize)

    const tasks = batches.map((batch) => this.processBulkBatch(batch))

    const batchResults = await Promise.all(tasks)

    const tickets = flatMap(batchResults)

    console.log(
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
        fields: [
          'id',
          'key',
          'summary',
          'issuetype',
          'status',
          'assignee',
          'priority',
          'project'
        ]
      })

      const tickets = compact(
        map(searchResult.issues || [], (issue) => {
          try {
            return this.convertToTicket(issue)
          } catch (error) {
            console.warn(
              `⚠️ JiraAPI: Failed to convert issue ${issue.key}:`,
              error
            )
            return null // Will be removed by compact()
          }
        })
      )

      // Log any issues that weren't found
      const foundKeys = new Set(tickets.map((t) => t.key))
      const missingKeys = batch.filter((key) => !foundKeys.has(key))
      if (missingKeys.length > 0) {
        console.warn(`⚠️ JiraAPI: Issues not found: ${missingKeys.join(', ')}`)
      }

      return tickets
    } catch (error) {
      console.error(`❌ JiraAPI: Bulk fetch failed for batch:`, error)

      return []
    }
  }

  /**
   * Converts a jira.js Issue to internal ticket format
   */
  private convertToTicket(issue: Issue): JiraTicket {
    const config = this.client.getConfig()

    return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary || '',
      issueType: {
        name: issue.fields?.issuetype?.name || '',
        iconUrl: issue.fields?.issuetype?.iconUrl || '',
        description: issue.fields?.issuetype?.description || ''
      },
      status: {
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
        : undefined,
      priority: issue.fields?.priority
        ? {
            name: issue.fields.priority.name || '',
            iconUrl: issue.fields.priority.iconUrl || ''
          }
        : undefined,
      projectKey: issue.fields?.project?.key || '',
      boardName: issue.fields?.project?.name || '',
      url: issue.self ?? `${config.baseUrl}/browse/${issue.key}`,
      lastViewed: new Date().toISOString()
    }
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
