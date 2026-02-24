/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { defineBackground } from '#imports'

import { registerAuthService } from '~/services/auth-service'
import { registerEntitlementService } from '~/services/entitlement-service'
import { registerJiraService } from '~/services/jira-service'
import { registerSuggestionService } from '~/services/suggestion-service'
import { registerTemplateService } from '~/services/template-service'
import { getLogger } from '~/utils/logger'

import { InstallationHandlerService } from './services/installation-handler'
import { OmniboxHandlerService } from './services/omnibox-handler'
import { SubscriptionSyncService } from './services/subscription-sync'

const log = getLogger('background')

export default defineBackground(() => {
  log.info('🚀 Background script initializing...')

  // Note: Storage migrations are handled automatically by WXT's built-in
  // versioning system when the extension updates. See schema.ts for details.

  // Initialize proxy services
  registerJiraService()
  registerSuggestionService()
  registerAuthService()
  registerTemplateService()
  registerEntitlementService()

  // Initialize alarms service
  SubscriptionSyncService.initialize()

  // Initialize other services
  OmniboxHandlerService.initialize()
  OmniboxHandlerService.setDefaultSuggestion(
    'Jump to a ticket key (PROJ-123) or search Jira'
  )

  InstallationHandlerService.initialize()

  log.info('✅ Background script initialized successfully')
  log.info('  - Extension Version:', InstallationHandlerService.getVersion())
})
