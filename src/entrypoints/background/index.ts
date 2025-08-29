/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { MessageRouter } from './messages/message-router'
import { OmniboxHandlerService } from './services/omnibox-handler'
import { InstallationHandlerService } from './services/installation-handler'

export default defineBackground(() => {
  console.log('🚀 Background script initializing...')

  try {
    // Initialize core services
    MessageRouter.initialize()
    OmniboxHandlerService.initialize()
    InstallationHandlerService.initialize()

    // Set up omnibox default suggestion
    OmniboxHandlerService.setDefaultSuggestion('Search Jira tickets or enter ticket key (e.g., PROJ-123)')

    console.log('✅ Background script initialized successfully')
    console.log('📊 Services status:')
    console.log('  - Message Router:', MessageRouter.getStats())
    console.log('  - Extension Version:', InstallationHandlerService.getVersion())
  } catch (error) {
    console.error('❌ Background script initialization failed:', error)
  }
})