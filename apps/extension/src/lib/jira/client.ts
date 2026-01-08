/**
 * Base Jira Client
 * Handles authentication, configuration, and provides access to jira.js modules
 */

import { BaseClient, Config } from 'jira.js'
import {
  IssuePriorities,
  IssueRemoteLinks,
  IssueSearch,
  Issues,
  Myself,
  Projects,
  ServerInfo
} from 'jira.js/version3'
import { catchError, of, skipWhile, Subscription, switchMap, timer } from 'rxjs'

import { getLogger } from '~/utils/logger'

import { fromStorage$, getStorageItem } from '../storage'

import { AuthApi } from './auth-api'
import type { JiraApiConfig } from './types'

const log = getLogger('jira-client')

/**
 * Base Jira client with authentication and jira.js module access
 */
export class JiraClient extends BaseClient {
  private static subscription: Subscription | null = null

  private authApi = new AuthApi()

  // jira.js modules
  issues = new Issues(this)
  issuePriorities = new IssuePriorities(this)
  issueRemoteLinks = new IssueRemoteLinks(this)
  issueSearch = new IssueSearch(this)
  myself = new Myself(this)
  projects = new Projects(this)
  serverInfo = new ServerInfo(this)

  constructor(private jiraConfig: JiraApiConfig) {
    const authConfig = JiraClient.getAuthConfig(jiraConfig)
    super(authConfig)

    if (jiraConfig.type === 'oauth' && !JiraClient.subscription) {
      JiraClient.subscription = this.setupAutoRefreshTokenSubscription()
    }
  }

  /**
   * Validate configuration and return jira.js auth config
   */
  private static getAuthConfig(config: JiraApiConfig): Config {
    if (config.type === 'oauth') {
      return {
        host: `https://api.atlassian.com/ex/jira/${config.instance_id}`,
        authentication: {
          oauth2: {
            accessToken: config.access_token
          }
        }
      }
    }

    if (config.type === 'apiKey') {
      return {
        host: config.host,
        authentication: {
          basic: {
            email: config.email,
            apiToken: config.apiKey
          }
        }
      }
    }

    throw new Error(`Unsupported authentication type: ${config}`)
  }

  /**
   * Updates the client configuration
   */
  private updateClientConfig(newConfig: JiraApiConfig): void {
    this.jiraConfig = newConfig
    // Reinitialize the client with new configuration
    Object.assign(this, new JiraClient(newConfig))
  }

  /**
   * Refresh OAuth token and update client if needed
   */
  private setupAutoRefreshTokenSubscription() {
    return fromStorage$('OAuthTokens')
      .pipe(
        skipWhile((tokens) => !tokens),
        switchMap((tokens) => {
          log.info('Received OAuth tokens update')
          if (!tokens) throw new Error('No tokens found')

          const expiresAtMs = new Date(tokens.expires_at).getTime()

          // Schedule refresh 5 minutes before token expires
          // if less than 5 min, refresh immediately
          const refreshDelay = Math.max(
            expiresAtMs - Date.now() - 5 * 60 * 1000,
            0
          )
          return timer(refreshDelay).pipe(
            switchMap(() => this.authApi.refreshToken(tokens)),
            catchError((error) => {
              log.error('Failed to refresh Jira tokens', error)
              getStorageItem('OAuthTokens').removeValue()
              getStorageItem('OAuthUserInfo').removeValue()
              return of<null>(null)
            })
          )
        })
      )
      .subscribe((newTokens) => {
        if (newTokens) {
          // Persist refreshed tokens so future refreshes are correctly scheduled
          getStorageItem('OAuthTokens').setValue(newTokens)
          this.updateClientConfig(newTokens)
        }
      })
  }

  /**
   * Gets the current configuration
   */
  getConfig(): JiraApiConfig {
    return { ...this.jiraConfig }
  }

  /**
   * Base URL for user-facing Jira pages
   */
  getWebBaseUrl(): string {
    const { host } = this.jiraConfig
    if (!host) return ''

    return host.endsWith('/') ? host.slice(0, -1) : host
  }
}
