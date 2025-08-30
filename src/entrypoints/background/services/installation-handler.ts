/**
 * Background service for handling extension installation and lifecycle events
 */

import { browser } from '#imports'
import { openOptionsPage } from '~/utils/extension'

export class InstallationHandlerService {
  /**
   * Initializes installation event listeners
   */
  static initialize(): void {
    browser.runtime.onInstalled.addListener(this.handleInstallation.bind(this))

    if (browser.runtime.onStartup) {
      browser.runtime.onStartup.addListener(this.handleStartup.bind(this))
    }
  }

  /**
   * Handles extension installation events
   */
  private static handleInstallation(
    details: chrome.runtime.InstalledDetails
  ): void {
    console.log('🎉 Extension installation event:', details.reason)

    switch (details.reason) {
      case 'install':
        this.handleFirstInstall()
        break
      case 'update':
        this.handleUpdate(details.previousVersion)
        break
      case 'chrome_update':
        this.handleChromeUpdate()
        break
      case 'shared_module_update':
        this.handleSharedModuleUpdate()
        break
    }
  }

  /**
   * Handles first-time installation
   */
  private static handleFirstInstall(): void {
    console.log('👋 Welcome! Opening options page for first-time setup')

    try {
      openOptionsPage()
    } catch (error) {
      console.error('❌ Failed to open options page on install:', error)
    }
  }

  /**
   * Handles extension updates
   */
  private static handleUpdate(previousVersion?: string): void {
    console.log(`🔄 Extension updated from version ${previousVersion}`)

    // Handle migration logic if needed
    this.handleMigration(previousVersion)
  }

  /**
   * Handles Chrome browser updates
   */
  private static handleChromeUpdate(): void {
    console.log('🌐 Chrome browser was updated')
    // Usually no action needed
  }

  /**
   * Handles shared module updates
   */
  private static handleSharedModuleUpdate(): void {
    console.log('📦 Shared module was updated')
    // Usually no action needed
  }

  /**
   * Handles extension startup (when browser starts)
   */
  private static handleStartup(): void {
    console.log('🚀 Extension started with browser')

    // Perform any startup tasks
    this.performStartupTasks()
  }

  /**
   * Handles data migration between versions
   */
  private static async handleMigration(
    previousVersion?: string
  ): Promise<void> {
    if (!previousVersion) return

    try {
      console.log(`🔄 Performing migration from version ${previousVersion}`)

      // Add migration logic here based on version comparisons
      // Example:
      // if (this.compareVersions(previousVersion, '2.0.0') < 0) {
      //   await this.migrateToV2()
      // }

      console.log('✅ Migration completed successfully')
    } catch (error) {
      console.error('❌ Migration failed:', error)
    }
  }

  /**
   * Performs tasks that should run on extension startup
   */
  private static async performStartupTasks(): Promise<void> {
    try {
      // Clean up old data, check for updates, etc.
      console.log('🧹 Performing startup cleanup tasks')

      // Example tasks:
      // - Clear old cache data
      // - Update configuration if needed
      // - Sync with remote services
    } catch (error) {
      console.error('❌ Startup tasks failed:', error)
    }
  }

  /**
   * Compares two version strings
   */
  private static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    const maxLength = Math.max(v1Parts.length, v2Parts.length)

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }

    return 0
  }

  /**
   * Gets extension information
   */
  static getExtensionInfo(): chrome.runtime.Manifest {
    return browser.runtime.getManifest()
  }

  /**
   * Gets extension version
   */
  static getVersion(): string {
    return this.getExtensionInfo().version
  }
}
