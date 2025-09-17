/**
 * Migration utilities for transitioning from API key to OAuth authentication
 */

import { getStorageItem } from '@/lib/storage'
import { oauthManager } from './oauth-manager'
import { type AuthType } from '../storage/schema'

// Simple logger replacement
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[MigrationUtils] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[MigrationUtils] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[MigrationUtils] ${msg}`, ...args)
}

export interface MigrationStatus {
  hasApiKeyAuth: boolean
  hasOAuthAuth: boolean
  currentAuthType: 'api_key' | 'oauth' | 'none'
  canMigrate: boolean
  migrationRecommended: boolean
}

export interface MigrationResult {
  success: boolean
  error?: string
  backupCreated?: boolean
}

/**
 * Migration utilities class
 */
export class MigrationUtils {
  /**
   * Check current authentication status and migration eligibility
   */
  static async checkMigrationStatus(): Promise<MigrationStatus> {
    try {
      const [authType, email, apiToken, oauthTokens] = await Promise.all([
        getStorageItem('AuthType').getValue(),
        getStorageItem('JiraUserEmail').getValue(),
        getStorageItem('JiraApiToken').getValue(),
        getStorageItem('OAuthTokens').getValue()
      ])

      const hasApiKeyAuth = !!(email && apiToken)
      const hasOAuthAuth = !!(oauthTokens && oauthTokens.access_token)
      const currentAuthType = authType || (hasApiKeyAuth ? 'api_key' : hasOAuthAuth ? 'oauth' : 'none')
      
      const canMigrate = hasApiKeyAuth && !hasOAuthAuth
      const migrationRecommended = currentAuthType === 'api_key' && hasApiKeyAuth

      return {
        hasApiKeyAuth,
        hasOAuthAuth,
        currentAuthType,
        canMigrate,
        migrationRecommended
      }
    } catch (error) {
      logger.error('Error checking migration status:', error)
      return {
        hasApiKeyAuth: false,
        hasOAuthAuth: false,
        currentAuthType: 'none',
        canMigrate: false,
        migrationRecommended: false
      }
    }
  }

  /**
   * Create backup of current API key configuration
   */
  static async createApiKeyBackup(): Promise<boolean> {
    try {
      const [host, email, apiToken] = await Promise.all([
        getStorageItem('JiraHost').getValue(),
        getStorageItem('JiraUserEmail').getValue(),
        getStorageItem('JiraApiToken').getValue()
      ])

      if (!email || !apiToken) {
        logger.warn('No API key configuration to backup')
        return false
      }

      const backup = {
        host,
        email,
        apiToken,
        backupDate: new Date().toISOString(),
        version: '1.0'
      }

      const currentLicense = await getStorageItem('License').getValue()
      const updatedLicense = currentLicense ? { ...currentLicense, apiKeyBackup: backup } : null
      if (updatedLicense) {
        await getStorageItem('License').setValue(updatedLicense)
      }
      logger.info('API key configuration backed up successfully')
      return true
    } catch (error) {
      logger.error('Error creating API key backup:', error)
      return false
    }
  }

  /**
   * Restore API key configuration from backup
   */
  static async restoreApiKeyBackup(): Promise<MigrationResult> {
    try {
      const license = await getStorageItem('License').getValue()
      const backup = license?.apiKeyBackup
      if (!backup) {
        return {
          success: false,
          error: 'No backup found'
        }
      }

      await Promise.all([
        getStorageItem('JiraHost').setValue(backup.host),
        getStorageItem('JiraUserEmail').setValue(backup.email),
        getStorageItem('JiraApiToken').setValue(backup.apiToken),
        getStorageItem('AuthType').setValue('api_key' as AuthType)
      ])

      logger.info('API key configuration restored from backup')
      return { success: true }
    } catch (error) {
      logger.error('Error restoring API key backup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Initiate OAuth migration process
   */
  static async initiateOAuthMigration(): Promise<MigrationResult> {
    try {
      const status = await this.checkMigrationStatus()
      if (!status.canMigrate) {
        return {
          success: false,
          error: 'Migration not possible - no API key auth or OAuth already configured'
        }
      }

      // Create backup before migration
      const backupCreated = await this.createApiKeyBackup()
      if (!backupCreated) {
        logger.warn('Failed to create backup, but continuing with migration')
      }

      // Get current host for OAuth flow
      const host = await getStorageItem('JiraHost').getValue()
      if (!host) {
        return {
          success: false,
          error: 'No Jira host configured'
        }
      }

      // Initiate OAuth flow
      await oauthManager.initiateOAuth(host)
      
      logger.info('OAuth migration initiated successfully')
      return {
        success: true,
        backupCreated
      }
    } catch (error) {
      logger.error('Error initiating OAuth migration:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Complete OAuth migration after successful authentication
   */
  static async completeOAuthMigration(): Promise<MigrationResult> {
    try {
      // Verify OAuth tokens are present
      const oauthTokens = await getStorageItem('OAuthTokens').getValue()
      if (!oauthTokens || !oauthTokens.access_token) {
        return {
          success: false,
          error: 'OAuth tokens not found'
        }
      }

      // Set auth type to OAuth
      await getStorageItem('AuthType').setValue('oauth' as AuthType)
      
      // Optionally clear API key data (keep backup)
      // await storage.setItem('email', null)
      // await storage.setItem('apiToken', null)
      
      logger.info('OAuth migration completed successfully')
      return { success: true }
    } catch (error) {
      logger.error('Error completing OAuth migration:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Rollback OAuth migration to API key
   */
  static async rollbackToApiKey(): Promise<MigrationResult> {
    try {
      // Clear OAuth data
      await oauthManager.clearTokens()
      await getStorageItem('AuthType').setValue('api_key' as AuthType)

      // Restore from backup if available
      const license = await getStorageItem('License').getValue()
      const backup = license?.apiKeyBackup
      if (backup) {
        await Promise.all([
          getStorageItem('JiraHost').setValue(backup.host),
          getStorageItem('JiraUserEmail').setValue(backup.email),
          getStorageItem('JiraApiToken').setValue(backup.apiToken)
        ])
      }

      logger.info('Rolled back to API key authentication')
      return { success: true }
    } catch (error) {
      logger.error('Error rolling back to API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean up migration artifacts
   */
  static async cleanupMigration(): Promise<void> {
    try {
      // Remove backup after successful migration
      const license = await getStorageItem('License').getValue()
      if (license?.apiKeyBackup) {
        const { apiKeyBackup, ...rest } = license
        await getStorageItem('License').setValue(rest)
      }
      logger.info('Migration cleanup completed')
    } catch (error) {
      logger.error('Error during migration cleanup:', error)
    }
  }

  /**
   * Get migration guidance message
   */
  static async getMigrationGuidance(): Promise<string> {
    const status = await this.checkMigrationStatus()
    
    if (status.currentAuthType === 'oauth') {
      return 'You are already using OAuth authentication. No migration needed.'
    }
    
    if (status.currentAuthType === 'none') {
      return 'Please configure authentication first.'
    }
    
    if (status.migrationRecommended) {
      return 'We recommend migrating to OAuth for better security and user experience. Your current API key configuration will be backed up.'
    }
    
    return 'OAuth migration is not available at this time.'
  }
}

// Export singleton instance
export const migrationUtils = MigrationUtils