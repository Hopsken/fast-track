import { getStorageItem } from '@/lib/storage';
import { OAUTH_CONFIG, type OAuthTokens, type OAuthUserInfo, type OAuthSettings, type AuthType } from '../storage/schema';

/**
 * OAuth Token Manager for Jira authentication
 * Handles token storage, encryption, and refresh using Web Crypto API
 */
export class OAuthTokenManager {
  private static instance: OAuthTokenManager;
  private encryptionKey: CryptoKey | null = null;
  private readonly ENCRYPTION_ALGORITHM = 'AES-GCM';
  private readonly KEY_DERIVATION_ALGORITHM = 'PBKDF2';
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;
  private readonly ITERATIONS = 100000;

  private constructor() {}

  static getInstance(): OAuthTokenManager {
    if (!OAuthTokenManager.instance) {
      OAuthTokenManager.instance = new OAuthTokenManager();
    }
    return OAuthTokenManager.instance;
  }

  /**
   * Initialize encryption key based on extension ID
   */
  private async initializeEncryptionKey(): Promise<void> {
    if (this.encryptionKey) return;

    try {
      const extensionId = chrome.runtime.id;
      const salt = await this.generateSalt(extensionId);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(extensionId),
        { name: this.KEY_DERIVATION_ALGORITHM },
        false,
        ['deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: this.KEY_DERIVATION_ALGORITHM,
          salt,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.ENCRYPTION_ALGORITHM,
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Generate consistent salt from extension ID
   */
  private async generateSalt(extensionId: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(extensionId + 'jira-oauth-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return hashBuffer.slice(0, this.SALT_LENGTH);
  }

  /**
   * Encrypt sensitive data
   */
  private async encrypt(data: string): Promise<string> {
    await this.initializeEncryptionKey();
    if (!this.encryptionKey) throw new Error('Encryption key not available');

    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.ENCRYPTION_ALGORITHM,
        iv
      },
      this.encryptionKey,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt sensitive data
   */
  private async decrypt(encryptedData: string): Promise<string> {
    await this.initializeEncryptionKey();
    if (!this.encryptionKey) throw new Error('Encryption key not available');

    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, this.IV_LENGTH);
    const data = combined.slice(this.IV_LENGTH);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: this.ENCRYPTION_ALGORITHM,
        iv
      },
      this.encryptionKey,
      data
    );

    return new TextDecoder().decode(decryptedData);
  }

  /**
   * Store OAuth tokens securely
   */
  async storeTokens(tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
      
      const encryptedTokens: OAuthTokens = {
        access_token: await this.encrypt(tokens.access_token),
        refresh_token: await this.encrypt(tokens.refresh_token),
        expires_at: expiresAt,
        token_type: 'Bearer'
      };

      await getStorageItem('OAuthTokens').setValue(encryptedTokens);
      await getStorageItem('LastRefresh').setValue(new Date().toISOString());
      await getStorageItem('AuthType').setValue('oauth' as AuthType);
    } catch (error) {
      console.error('Failed to store OAuth tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Retrieve and decrypt OAuth tokens
   */
  async getTokens(): Promise<{ access_token: string; refresh_token: string; expires_at: string } | null> {
    try {
      const encryptedTokens = await getStorageItem('OAuthTokens').getValue();
      if (!encryptedTokens) return null;

      return {
        access_token: await this.decrypt(encryptedTokens.access_token),
        refresh_token: await this.decrypt(encryptedTokens.refresh_token),
        expires_at: encryptedTokens.expires_at
      };
    } catch (error) {
      console.error('Failed to retrieve OAuth tokens:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  async isTokenExpired(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) return true;

    const expiresAt = new Date(tokens.expires_at);
    const now = new Date();
    // Consider token expired 5 minutes before actual expiration
    const bufferTime = 5 * 60 * 1000;
    
    return now.getTime() >= (expiresAt.getTime() - bufferTime);
  }

  /**
   * Refresh OAuth tokens using refresh token
   */
  async refreshTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const clientId = await getStorageItem('ClientId').getValue();
      if (!clientId) {
        throw new Error('OAuth client ID not configured');
      }

      const response = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: clientId,
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const newTokens = await response.json();
      await this.storeTokens(newTokens);
      
      return true;
    } catch (error) {
      console.error('Failed to refresh OAuth tokens:', error);
      await this.clearTokens();
      return false;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      if (await this.isTokenExpired()) {
        const refreshed = await this.refreshTokens();
        if (!refreshed) return null;
      }

      const tokens = await this.getTokens();
      return tokens?.access_token || null;
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      return null;
    }
  }

  /**
   * Store user information
   */
  async storeUserInfo(userInfo: OAuthUserInfo): Promise<void> {
    await getStorageItem('OAuthUserInfo').setValue(userInfo);
  }

  /**
   * Get stored user information
   */
  async getUserInfo(): Promise<OAuthUserInfo | null> {
    return await getStorageItem('OAuthUserInfo').getValue();
  }

  /**
   * Set OAuth client ID
   */
  async setClientId(clientId: string): Promise<void> {
    await getStorageItem('ClientId').setValue(clientId);
  }

  /**
   * Get OAuth settings
   */
  async getSettings(): Promise<OAuthSettings> {
    const settings = await getStorageItem('OAuthSettings').getValue();
    return settings || {
      auto_refresh: true,
      notification_enabled: true,
      migration_completed: false,
    };
  }

  /**
   * Update OAuth settings
   */
  async updateSettings(settings: Partial<OAuthSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    await getStorageItem('OAuthSettings').setValue({ ...currentSettings, ...settings });
  }

  /**
   * Check if OAuth is configured and active
   */
  async isOAuthActive(): Promise<boolean> {
    const authType = await getStorageItem('AuthType').getValue();
    const tokens = await this.getTokens();
    return authType === 'oauth' && tokens !== null;
  }

  /**
   * Clear all OAuth data
   */
  async clearTokens(): Promise<void> {
    await getStorageItem('OAuthTokens').setValue(null);
    await getStorageItem('OAuthUserInfo').setValue(null);
    await getStorageItem('LastRefresh').setValue('');
    await getStorageItem('AuthType').setValue(null);
  }

  /**
   * Get authentication type
   */
  async getAuthType(): Promise<AuthType> {
    return await getStorageItem('AuthType').getValue() || null;
  }

  /**
   * Set authentication type
   */
  async setAuthType(type: AuthType): Promise<void> {
    await getStorageItem('AuthType').setValue(type);
  }

  /**
   * Initiate OAuth flow (for migration purposes)
   */
  async initiateOAuth(host: string): Promise<void> {
    // Store the host for OAuth flow
    await getStorageItem('JiraHost').setValue(host);
    
    // This method is primarily for migration
    // The actual OAuth flow is handled by the background service
    console.log('OAuth: Initiate OAuth flow for host:', host);
  }
}

// Export singleton instance
export const oauthManager = OAuthTokenManager.getInstance();