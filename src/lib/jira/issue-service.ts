/**
 * Service for Jira issue-specific API operations
 */

import { JiraApiClient } from './api-client'
import type { JiraApiIssue } from './types'

import type { JiraTicket } from '~/storage'

export class JiraIssueService {
  private rateLimitDelay = 100 // ms between requests

  constructor(private client: JiraApiClient) {}

  /**
   * Fetches a single issue by key
   */
  async getIssue(issueKey: string): Promise<JiraTicket | null> {
    try {
      console.log(`🎫 JiraAPI: Fetching issue ${issueKey}`)

      const issue = await this.client.makeRequest<JiraApiIssue>(
        `issue/${issueKey}`
      )
      const ticket = this.convertToTicket(issue)

      console.log(
        `✅ JiraAPI: Successfully converted issue ${issueKey} to ticket:`,
        ticket
      )
      return ticket
    } catch (error) {
      console.error(`❌ JiraAPI: Failed to fetch issue ${issueKey}:`, error)
      return null
    }
  }

  /**
   * Fetches multiple issues in batches
   */
  async getIssues(issueKeys: string[]): Promise<JiraTicket[]> {
    console.log(
      `🎫 JiraAPI: Batch fetching ${issueKeys.length} issues:`,
      issueKeys
    )

    const tickets: JiraTicket[] = []
    const batchSize = 10 // Process in smaller batches to avoid overwhelming the API

    for (let i = 0; i < issueKeys.length; i += batchSize) {
      const batch = issueKeys.slice(i, i + batchSize)
      console.log(
        `📦 JiraAPI: Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(issueKeys.length / batchSize)}`
      )

      const batchResults = await this.processBatch(batch)
      tickets.push(...batchResults)
    }

    console.log(
      `✅ JiraAPI: Batch fetch completed. Successfully fetched ${tickets.length}/${issueKeys.length} issues`
    )
    return tickets
  }

  /**
   * Processes a batch of issue keys
   */
  private async processBatch(batch: string[]): Promise<JiraTicket[]> {
    const batchPromises = batch.map(async (key, index) => {
      // Add small delay between requests to respect rate limits
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay))
      }
      return this.getIssue(key)
    })

    const batchResults = await Promise.allSettled(batchPromises)

    const tickets: JiraTicket[] = []
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        tickets.push(result.value)
      } else {
        console.warn(
          `⚠️ JiraAPI: Failed to fetch issue ${batch[index]}:`,
          result.status === 'rejected' ? result.reason : 'Unknown error'
        )
      }
    })

    return tickets
  }

  /**
   * Converts a Jira API issue to internal ticket format
   */
  private convertToTicket(issue: JiraApiIssue): JiraTicket {
    const config = this.client.getConfig()

    return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
      projectKey: issue.fields.project.key,
      boardName: issue.fields.project.name,
      url: `${config.baseUrl}/browse/${issue.key}`,
      lastViewed: new Date().toISOString(),
      viewCount: 1
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
