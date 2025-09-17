import { getStorageItem } from '@/lib/storage/schema';
import { oauthManager } from './oauth-manager';
import { JiraAuthService } from './auth';
import { JiraClient } from './client';

export interface MigrationStatus {
  isRequired: boolean;
  currentAuthType: 'api_key' | 'oauth' | 'none';
  hasApiKey: boolean;
  hasOAuthTokens: boolean;
  migrationCompleted: boolean;
  shouldPrompt: boolean;
  isPromptDismissed: boolean;
}

export interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}

export class OAuthMigrationService {
  private static instance: OAuthMigrationService;

  static getInstance(): OAuthMigrationService {
    if (!this.instance) {
      this.instance = new OAuthMigrationService();
    }
    return this.instance;
  }

  /**
   * Check if migration is required and get current status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      const [apiToken, authType, oauthTokens] = await Promise.all([
        getStorageItem('JiraApiToken').getValue(),
        getStorageItem('AuthType').getValue(),
        oauthManager.getTokens()
      ]);

      const hasApiKey = !!apiToken;
      const hasOAuthTokens = !!oauthTokens;
      const currentAuthType = authType || (hasApiKey ? 'api_key' : 'none');
      
      // Migration is required if user has API key but no OAuth tokens
      const isRequired = hasApiKey && !hasOAuthTokens && currentAuthType === 'api_key';
      
      // Migration is completed if user has OAuth tokens and auth type is set to oauth
      const migrationCompleted = hasOAuthTokens && currentAuthType === 'oauth';

      const shouldPrompt = await this.shouldPromptMigration();
      const settings = await getStorageItem('OAuthSettings').getValue();
      const isPromptDismissed = settings?.migration_completed || false;

      return {
        isRequired,
        currentAuthType: currentAuthType as 'api_key' | 'oauth' | 'none',
        hasApiKey,
        hasOAuthTokens,
        migrationCompleted,
        shouldPrompt,
        isPromptDismissed
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      return {
        isRequired: false,
        currentAuthType: 'none',
        hasApiKey: false,
        hasOAuthTokens: false,
        migrationCompleted: false,
        shouldPrompt: false,
        isPromptDismissed: false
      };
    }
  }

  /**
   * Get migration steps with current status
   */
  async getMigrationSteps(): Promise<MigrationStep[]> {
    const status = await this.getMigrationStatus();
    
    const steps: MigrationStep[] = [
      {
        id: 'backup_config',
        title: 'Backup Current Configuration',
        description: 'Save your current API key configuration as backup',
        status: 'pending'
      },
      {
        id: 'oauth_setup',
        title: 'Set Up OAuth Authentication',
        description: 'Connect your Jira account using OAuth for enhanced security',
        status: 'pending'
      },
      {
        id: 'test_connection',
        title: 'Test OAuth Connection',
        description: 'Verify that OAuth authentication is working correctly',
        status: 'pending'
      },
      {
        id: 'cleanup_api_key',
        title: 'Clean Up API Key (Optional)',
        description: 'Remove the old API key configuration after successful migration',
        status: 'pending'
      }
    ];

    // Update step statuses based on current state
    if (status.hasApiKey) {
      steps[0].status = 'completed';
    }

    if (status.hasOAuthTokens) {
      steps[1].status = 'completed';
      steps[2].status = 'completed';
    }

    if (status.migrationCompleted) {
      steps.forEach(step => {
        if (step.status !== 'error') {
          step.status = 'completed';
        }
      });
    }

    return steps;
  }

  /**
   * Start the migration process
   */
  async startMigration(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await this.getMigrationStatus();
      
      if (!status.isRequired) {
        return { success: false, error: 'Migration is not required' };
      }

      // Step 1: Backup current configuration (already done if API key exists)
      if (!status.hasApiKey) {
        return { success: false, error: 'No API key found to migrate from' };
      }

      // Step 2: OAuth setup will be handled by the UI
      // This service just validates the process
      
      return { success: true };
    } catch (error) {
      console.error('Failed to start migration:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Complete the migration after OAuth tokens are obtained
   */
  async completeMigration(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await this.getMigrationStatus();
      
      if (!status.hasOAuthTokens) {
        return { success: false, error: 'OAuth tokens not found. Please complete OAuth setup first.' };
      }

      // Test OAuth connection
      const testResult = await this.testOAuthConnection();
      if (!testResult.success) {
        return { success: false, error: testResult.error || 'OAuth connection test failed' };
      }

      // Set auth type to OAuth
      await oauthManager.setAuthType('oauth');

      return { success: true };
    } catch (error) {
      console.error('Failed to complete migration:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test OAuth connection
   */
  private async testOAuthConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await oauthManager.getTokens();
      if (!tokens) {
        return { success: false, error: 'No OAuth tokens found' };
      }

      // Create OAuth client and test connection
      const baseUrl = await getStorageItem('JiraHost').getValue();
      if (!baseUrl) {
        return { success: false, error: 'Jira host not configured' };
      }

      const client = await JiraClient.createWithOAuth({
        baseUrl,
        accessToken: tokens.access_token
      });

      const authService = new JiraAuthService(client);
      const testResult = await authService.testConnection();
      
      return testResult;
    } catch (error) {
      console.error('OAuth connection test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Connection test failed' };
    }
  }

  /**
   * Clean up API key configuration after successful migration
   */
  async cleanupApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await this.getMigrationStatus();
      
      if (!status.migrationCompleted) {
        return { success: false, error: 'Migration not completed. Cannot clean up API key.' };
      }

      // Remove API key and email
      await Promise.all([
        getStorageItem('JiraApiToken').setValue(''),
        getStorageItem('JiraUserEmail').setValue('')
      ]);

      return { success: true };
    } catch (error) {
      console.error('Failed to cleanup API key:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Cleanup failed' };
    }
  }

  /**
   * Rollback migration and restore API key authentication
   */
  async rollbackMigration(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await this.getMigrationStatus();
      
      if (!status.hasApiKey) {
        return { success: false, error: 'No API key configuration found to rollback to' };
      }

      // Set auth type back to API key
      await oauthManager.setAuthType('api_key');

      // Optionally clear OAuth tokens
      await oauthManager.clearTokens();

      return { success: true };
    } catch (error) {
      console.error('Failed to rollback migration:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Rollback failed' };
    }
  }

  /**
   * Check if user should be prompted for migration
   */
  async shouldPromptMigration(): Promise<boolean> {
    try {
      const status = await this.getMigrationStatus();
      
      // Don't prompt if migration is not required or already completed
      if (!status.isRequired || status.migrationCompleted) {
        return false;
      }

      // Check if user has dismissed migration prompt recently
      const dismissedUntil = await getStorageItem('OAuthSettings').getValue();
      if (dismissedUntil?.migration_completed) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check migration prompt status:', error);
      return false;
    }
  }

  /**
   * Dismiss migration prompt for a specified duration
   */
  async dismissMigrationPrompt(durationDays: number = 7): Promise<void> {
    try {
      const dismissUntil = new Date();
      dismissUntil.setDate(dismissUntil.getDate() + durationDays);
      
      const settings = await getStorageItem('OAuthSettings').getValue() || {
        auto_refresh: true,
        notification_enabled: true,
        migration_completed: false
      };
      await getStorageItem('OAuthSettings').setValue({
        ...settings,
        migration_completed: true
      });
    } catch (error) {
      console.error('Failed to dismiss migration prompt:', error);
    }
  }
}

// Export singleton instance
export const migrationService = OAuthMigrationService.getInstance();