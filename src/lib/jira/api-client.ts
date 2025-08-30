/**
 * HTTP client abstraction for Jira API calls
 */

import type { JiraApiConfig, JiraApiError } from './types'

export class JiraApiClient {
  constructor(private config: JiraApiConfig) {}

  /**
   * Makes an authenticated HTTP request to the Jira API
   */
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`

    console.log(`🌐 JiraAPI: Fetching ${url}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      })

      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint)
      }

      const data = await response.json()
      console.log(`✅ JiraAPI: Successfully fetched data from ${endpoint}`)
      return data
    } catch (error) {
      console.error(`❌ JiraAPI: Request failed for ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Gets authentication headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    if (this.config.email && this.config.apiToken) {
      const auth = btoa(`${this.config.email}:${this.config.apiToken}`)
      headers['Authorization'] = `Basic ${auth}`
    }

    return headers
  }

  /**
   * Handles error responses from the API
   */
  private async handleErrorResponse(
    response: Response,
    endpoint: string
  ): Promise<never> {
    const errorText = await response.text()
    console.error(`❌ JiraAPI: HTTP ${response.status} - ${errorText}`)

    let errorMessage: string

    switch (response.status) {
      case 401:
        errorMessage =
          'Authentication failed. Please check your API token and email.'
        break
      case 403:
        errorMessage = 'Access forbidden. Please check your permissions.'
        break
      case 404:
        errorMessage = 'Resource not found. Please check the issue key or URL.'
        break
      default:
        errorMessage = `HTTP ${response.status}: ${errorText}`
    }

    throw new Error(errorMessage)
  }

  /**
   * Updates the client configuration
   */
  updateConfig(newConfig: Partial<JiraApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Gets the current configuration (without sensitive data)
   */
  getConfig(): Omit<JiraApiConfig, 'apiToken'> {
    const { apiToken, ...safeConfig } = this.config
    return safeConfig
  }
}
