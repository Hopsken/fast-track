import { JiraTicket } from '~/storage'

export interface JiraApiConfig {
  baseUrl: string
  email?: string
  apiToken?: string
}

export interface JiraApiIssue {
  id: string
  key: string
  fields: {
    summary: string
    status: {
      name: string
      statusCategory: {
        name: string
        colorName: string
      }
    }
    assignee?: {
      displayName: string
      emailAddress: string
      accountId: string
    }
    priority?: {
      name: string
      iconUrl: string
    }
    project: {
      key: string
      name: string
    }
    issuetype: {
      name: string
      iconUrl: string
    }
    labels: string[]
    components: Array<{
      name: string
    }>
  }
}

export interface JiraApiError {
  errorMessages: string[]
  errors: Record<string, string>
}

export class JiraApiService {
  private config: JiraApiConfig
  private rateLimitDelay = 100 // ms between requests

  constructor(config: JiraApiConfig) {
    this.config = config
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (this.config.email && this.config.apiToken) {
      const auth = btoa(`${this.config.email}:${this.config.apiToken}`)
      headers['Authorization'] = `Basic ${auth}`
    }

    return headers
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`
    
    console.log(`🌐 JiraAPI: Fetching ${url}`)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ JiraAPI: HTTP ${response.status} - ${errorText}`)
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API token and email.')
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.')
        }
        if (response.status === 404) {
          throw new Error('Resource not found. Please check the issue key or URL.')
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ JiraAPI: Successfully fetched data from ${endpoint}`)
      return data
    } catch (error) {
      console.error(`❌ JiraAPI: Request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getIssue(issueKey: string): Promise<JiraTicket | null> {
    try {
      console.log(`🎫 JiraAPI: Fetching issue ${issueKey}`)
      
      const issue = await this.makeRequest<JiraApiIssue>(`issue/${issueKey}`)
      
      const ticket: JiraTicket = {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        projectKey: issue.fields.project.key,
        boardName: issue.fields.project.name,
        url: `${this.config.baseUrl}/browse/${issue.key}`,
        lastViewed: new Date().toISOString(),
        viewCount: 1
      }

      console.log(`✅ JiraAPI: Successfully converted issue ${issueKey} to ticket:`, ticket)
      return ticket
    } catch (error) {
      console.error(`❌ JiraAPI: Failed to fetch issue ${issueKey}:`, error)
      return null
    }
  }

  async getIssues(issueKeys: string[]): Promise<JiraTicket[]> {
    console.log(`🎫 JiraAPI: Batch fetching ${issueKeys.length} issues:`, issueKeys)
    
    const tickets: JiraTicket[] = []
    const batchSize = 10 // Process in smaller batches to avoid overwhelming the API
    
    for (let i = 0; i < issueKeys.length; i += batchSize) {
      const batch = issueKeys.slice(i, i + batchSize)
      console.log(`📦 JiraAPI: Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(issueKeys.length / batchSize)}`)
      
      const batchPromises = batch.map(async (key, index) => {
        // Add small delay between requests to respect rate limits
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay))
        }
        return this.getIssue(key)
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          tickets.push(result.value)
        } else {
          console.warn(`⚠️ JiraAPI: Failed to fetch issue ${batch[index]}:`, 
                      result.status === 'rejected' ? result.reason : 'Unknown error')
        }
      })
    }
    
    console.log(`✅ JiraAPI: Batch fetch completed. Successfully fetched ${tickets.length}/${issueKeys.length} issues`)
    return tickets
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 JiraAPI: Testing connection...')
      await this.makeRequest('myself')
      console.log('✅ JiraAPI: Connection test successful')
      return true
    } catch (error) {
      console.error('❌ JiraAPI: Connection test failed:', error)
      return false
    }
  }

  static extractJiraUrlFromCurrentPage(): string {
    const hostname = window.location.hostname
    if (hostname.includes('atlassian.net')) {
      return `https://${hostname}`
    }
    return ''
  }

  static isValidJiraUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('atlassian.net') || 
             urlObj.pathname.includes('/jira')
    } catch {
      return false
    }
  }
}