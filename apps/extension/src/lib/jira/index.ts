/**
 * Jira API - Singleton service with transparent auth management
 *
 * Usage:
 *   const jira = getJiraApi()
 *   const ticket = await jira.issues.getIssue('KEY-123')
 */

import { AgileClient, Config, Version3Client } from 'jira.js'

import { JiraUserSchema } from '@/repository/schema'
import { AuthCredentials, JiraUserInfo } from '@/types'
import { isNonNullable } from '@/utils/assert'
import { getLogger } from '@/utils/logger'

import { JiraAgileService } from './agile'
import { AuthManager } from './authManager'
import { JiraIssueService } from './issues'
import { JiraProjectService } from './projects'

const log = getLogger('jira-api')

/**
 * Jira API singleton with automatic auth management.
 *
 * Credentials are cached from storage subscription - no async storage reads on API calls.
 * Token refresh is handled proactively via scheduled timeouts.
 */
export class JiraAPI {
  private static _instance: JiraAPI | null = null

  private clientCredentialsSignature: string | null = null
  private v3Client: Version3Client | null = null
  private agileClient: AgileClient | null = null

  private authManager: AuthManager

  public issues: JiraIssueService
  public projects: JiraProjectService
  public agile: JiraAgileService

  private constructor() {
    this.authManager = AuthManager.getInstance()
    this.issues = new JiraIssueService(() => this.getClient())
    this.projects = new JiraProjectService(() => this.getClient())
    this.agile = new JiraAgileService(() => this.getAgileClient())
  }

  public static getInstance(): JiraAPI {
    if (!JiraAPI._instance) {
      JiraAPI._instance = new JiraAPI()
    }
    return JiraAPI._instance
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Client Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the jira.js V3 client.
   * Uses cached credentials from subscription.
   * Falls back to storage read if subscription hasn't emitted yet.
   */
  private async getClients(): Promise<{
    coreClient: Version3Client
    agileClient: AgileClient
  }> {
    // Get credentials from auth manager (cached from subscription)
    const credentials = await this.authManager.getCredentials()

    if (!credentials) {
      throw new Error('Jira not configured')
    }

    // Return cached client if credentials haven't changed
    const signature = AuthManager.computeSignature(credentials)
    if (
      this.v3Client &&
      this.agileClient &&
      this.clientCredentialsSignature === signature
    ) {
      return {
        coreClient: this.v3Client,
        agileClient: this.agileClient
      }
    }

    // Create new client
    const clientConfig = await buildClientConfig(credentials)
    this.v3Client = new Version3Client(clientConfig)
    this.agileClient = new AgileClient(clientConfig)
    this.clientCredentialsSignature = signature

    log.debug('Created new jira.js client')

    return {
      coreClient: this.v3Client,
      agileClient: this.agileClient
    }
  }

  private async getClient(): Promise<Version3Client> {
    const { coreClient } = await this.getClients()
    return coreClient
  }

  private async getAgileClient(): Promise<AgileClient> {
    const { agileClient } = await this.getClients()
    return agileClient
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get current user info
   */
  async getMyself(): Promise<JiraUserInfo> {
    const client = await this.getClient()
    const user = await client.myself.getCurrentUser()
    return {
      accountId: user.accountId,
      email: user.emailAddress ?? '',
      name: user.displayName ?? '',
      avatarUrl: user.avatarUrls?.['16x16']
    }
  }

  async getLabels() {
    const client = await this.getClient()
    const result = await client.labels.getAllLabels()
    return result.values ?? []
  }

  async searchUserOfProject(projectKey: string, query: string) {
    const client = await this.getClient()
    const result = await client.userSearch.findUsersWithBrowsePermission({
      projectKey,
      query
    })
    return result
      .filter((user) => user.accountType === 'atlassian')
      .map((user) => JiraUserSchema.safeParse(user).data)
      .filter(isNonNullable)
  }

  /**
   * Send a raw request to Jira API
   */
  async request<T>(
    config: Parameters<Version3Client['sendRequest']>[0]
  ): Promise<T> {
    const client = await this.getClient()
    return client.sendRequest<T>(config, undefined as never)
  }

  /**
   * Get current host URL (if connected)
   */
  async getHost(): Promise<string | null> {
    const credentials = await this.authManager.getCredentials()
    const host = credentials?.host
    if (!host) return null
    return host.endsWith('/') ? host.slice(0, -1) : host
  }

  /**
   * Check if Jira is configured
   */
  async isConfigured(): Promise<boolean> {
    const credentials = await this.authManager.getCredentials()
    return !!credentials
  }

  /**
   * Validate credentials without affecting singleton state.
   * Used during login flow.
   */
  static async validateCredentials(
    credentials: AuthCredentials
  ): Promise<JiraUserInfo> {
    const client = new Version3Client(await buildClientConfig(credentials))
    const user = await client.myself.getCurrentUser()
    return {
      accountId: user.accountId,
      email: user.emailAddress ?? '',
      name: user.displayName ?? '',
      avatarUrl: user.avatarUrls?.['16x16']
    }
  }
}

/**
 * Build jira.js client config from AuthCredentials.
 *
 * Note: This is async so we can lazy-load E2E-only mocking code without
 * pulling it into normal bundles.
 */
async function buildClientConfig(
  credentials: AuthCredentials
): Promise<Config> {
  if (credentials.type === 'oauth' && credentials.oauth) {
    return {
      host: `https://api.atlassian.com/ex/jira/${credentials.oauth.instance_id}`,
      authentication: {
        oauth2: {
          accessToken: credentials.oauth.access_token
        }
      }
    }
  }

  if (credentials.type === 'apiKey' && credentials.apiKey) {
    // Extra safety guard:
    // - `VITE_E2E_MOCKS` is a build-time flag
    // - `__JIRA_BOOST_E2E__` must be enabled at runtime by the Playwright fixture
    // This reduces the risk of accidentally shipping mocked Jira behavior.
    const runtimeFlagEnabled =
      (globalThis as unknown as { __JIRA_BOOST_E2E__?: boolean })
        .__JIRA_BOOST_E2E__ === true

    const webdriverEnabled =
      typeof navigator !== 'undefined' && navigator.webdriver === true

    const runtimeE2EEnabled = runtimeFlagEnabled || webdriverEnabled

    const isE2E = import.meta.env.VITE_E2E_MOCKS === '1' && runtimeE2EEnabled

    let baseRequestConfig: Config['baseRequestConfig'] | undefined

    if (isE2E) {
      const { createJiraE2EMockAdapter } = await import('./e2e/axios-mocks')
      baseRequestConfig = {
        // Use an axios adapter to mock Jira responses in e2e.
        // This is the most reliable approach because jira.js uses axios internally.
        adapter: createJiraE2EMockAdapter()
      }
    }

    return {
      host: credentials.host,
      baseRequestConfig,
      authentication: {
        basic: {
          email: credentials.apiKey.email,
          apiToken: credentials.apiKey.apiKey
        }
      }
    }
  }

  throw new Error('Invalid credentials: missing oauth or apiKey data')
}
