/**
 * Background service for handling extension installation and lifecycle events
 */

import { browser } from 'wxt/browser'

import { openOptionsPage } from '~/utils/extension'
import { getLogger } from '~/utils/logger'

export class InstallationHandlerService {
  private static log = getLogger('installation-handler')

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
    this.log.info('🎉 Extension installation event:', details.reason)

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
    this.log.info('👋 Welcome! Opening options page for first-time setup')

    // Skip in E2E test builds to prevent the install-time options page from
    // navigating the test popup page (browser.runtime.openOptionsPage queues
    // a tab navigation that fires asynchronously into the active page).
    if (import.meta.env.VITE_E2E_MOCKS === '1') return

    try {
      openOptionsPage()
    } catch (error) {
      this.log.error('❌ Failed to open options page on install:', error)
    }
  }

  /**
   * Handles extension updates
   */
  private static handleUpdate(previousVersion?: string): void {
    this.log.info(`🔄 Extension updated from version ${previousVersion}`)
  }

  /**
   * Handles Chrome browser updates
   */
  private static handleChromeUpdate(): void {
    this.log.info('🌐 Chrome browser was updated')
    // Usually no action needed
  }

  /**
   * Handles shared module updates
   */
  private static handleSharedModuleUpdate(): void {
    this.log.info('📦 Shared module was updated')
    // Usually no action needed
  }

  /**
   * Handles extension startup (when browser starts)
   */
  private static handleStartup(): void {
    this.log.info('🚀 Extension started with browser')
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
