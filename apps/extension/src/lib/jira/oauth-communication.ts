import { oauthManager } from './oauth-manager';
import { getStorageItem } from '@/lib/storage';

/**
 * OAuth message types for communication between website and extension
 */
export interface OAuthMessage {
  type: 'JIRA_OAUTH_SUCCESS' | 'JIRA_OAUTH_ERROR';
  data: OAuthSuccessData | OAuthErrorData;
  origin: string;
}

export interface OAuthSuccessData {
  refresh_token: string;
  access_token: string;
  expires_at: string; // ISO timestamp
  user_info: {
    account_id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface OAuthErrorData {
  error: string;
  error_description?: string;
}

/**
 * OAuth communication service for handling secure token exchange
 * between the website and extension via postMessage
 */
export class OAuthCommunicationService {
  private static instance: OAuthCommunicationService;
  private allowedOrigins: string[] = [
    'https://jira-boost.com',
    'https://www.jira-boost.com',
    'http://localhost:3000', // Development
    'http://localhost:3001', // Development
  ];

  private constructor() {}

  public static getInstance(): OAuthCommunicationService {
    if (!OAuthCommunicationService.instance) {
      OAuthCommunicationService.instance = new OAuthCommunicationService();
    }
    return OAuthCommunicationService.instance;
  }

  /**
   * Initialize the OAuth communication service
   * Sets up message listeners for postMessage communication
   */
  public initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  /**
   * Setup message listener for background script communication
   * This method is called by the background service
   */
  public setupMessageListener(): void {
    this.initialize();
  }

  /**
   * Clean up message listeners
   */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
  }

  /**
   * Handle incoming postMessage from the website
   */
  private async handleMessage(event: MessageEvent): Promise<void> {
    try {
      // Validate origin
      if (!this.isValidOrigin(event.origin)) {
        console.warn('OAuth: Invalid origin:', event.origin);
        return;
      }

      // Parse and validate message
      const message = this.parseMessage(event.data);
      if (!message) {
        console.warn('OAuth: Invalid message format');
        return;
      }

      // Process the OAuth message
      await this.processOAuthMessage(message);
    } catch (error) {
      console.error('OAuth: Error handling message:', error);
    }
  }

  /**
   * Validate if the origin is allowed
   */
  private isValidOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin);
  }

  /**
   * Parse and validate the incoming message
   */
  private parseMessage(data: any): OAuthMessage | null {
    try {
      if (typeof data !== 'object' || !data.type) {
        return null;
      }

      // Validate message type
      if (!['JIRA_OAUTH_SUCCESS', 'JIRA_OAUTH_ERROR'].includes(data.type)) {
        return null;
      }

      return data as OAuthMessage;
    } catch (error) {
      console.error('OAuth: Error parsing message:', error);
      return null;
    }
  }

  /**
   * Process the OAuth message based on its type
   */
  private async processOAuthMessage(message: OAuthMessage): Promise<void> {
    switch (message.type) {
      case 'JIRA_OAUTH_SUCCESS':
        await this.handleOAuthSuccess(message.data as OAuthSuccessData);
        break;
      case 'JIRA_OAUTH_ERROR':
        await this.handleOAuthError(message.data as OAuthErrorData);
        break;
      default:
        console.warn('OAuth: Unknown message type:', message.type);
    }
  }

  /**
   * Handle successful OAuth token reception
   */
  private async handleOAuthSuccess(data: OAuthSuccessData): Promise<void> {
    try {
      console.log('OAuth: Received tokens successfully');

      // Store tokens using the OAuth manager - convert expires_at to expires_in
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      await oauthManager.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: expiresIn
      });

      // Store user info
      await oauthManager.storeUserInfo(data.user_info);

      // Set auth type to OAuth
      await oauthManager.setAuthType('oauth');

      // Update settings to mark migration as completed
      const currentSettings = await oauthManager.getSettings();
      await oauthManager.updateSettings({
        ...currentSettings,
        migration_completed: true
      });

      console.log('OAuth: Token storage completed successfully');

      // Notify other parts of the extension about successful OAuth
      this.notifyOAuthSuccess();
    } catch (error) {
      console.error('OAuth: Error storing tokens:', error);
      this.notifyOAuthError('Failed to store OAuth tokens');
    }
  }

  /**
   * Handle OAuth error
   */
  private async handleOAuthError(data: OAuthErrorData): Promise<void> {
    console.error('OAuth: Received error:', data.error, data.error_description);
    this.notifyOAuthError(data.error_description || data.error);
  }

  /**
   * Notify other parts of the extension about successful OAuth
   */
  private notifyOAuthSuccess(): void {
    // Send message to background script or other parts of the extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'OAUTH_SUCCESS',
        timestamp: new Date().toISOString()
      }).catch(error => {
        console.warn('OAuth: Could not notify background script:', error);
      });
    }

    // Dispatch custom event for content scripts or popup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oauth-success', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Notify other parts of the extension about OAuth error
   */
  private notifyOAuthError(error: string): void {
    // Send message to background script or other parts of the extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'OAUTH_ERROR',
        error,
        timestamp: new Date().toISOString()
      }).catch(err => {
        console.warn('OAuth: Could not notify background script:', err);
      });
    }

    // Dispatch custom event for content scripts or popup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oauth-error', {
        detail: { error, timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Initiate OAuth flow (for testing purposes)
   */
  public async initiateOAuth(): Promise<void> {
    // This method is primarily for testing
    // In practice, OAuth is initiated through the background service
    console.log('OAuth: Initiate OAuth flow called');
  }

  /**
   * Add a custom allowed origin (useful for development)
   */
  public addAllowedOrigin(origin: string): void {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
    }
  }

  /**
   * Remove an allowed origin
   */
  public removeAllowedOrigin(origin: string): void {
    const index = this.allowedOrigins.indexOf(origin);
    if (index > -1) {
      this.allowedOrigins.splice(index, 1);
    }
  }

  /**
   * Get current allowed origins
   */
  public getAllowedOrigins(): string[] {
    return [...this.allowedOrigins];
  }
}

// Export singleton instance
export const oauthCommunication = OAuthCommunicationService.getInstance();