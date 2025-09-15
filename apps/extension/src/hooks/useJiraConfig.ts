/**
 * Hooks for settings management
 */

import { useCallback } from 'react'

import { STORAGE_GROUPS } from '@/lib/storage'
import type { JiraApiConfig } from '~/lib/jira/types'

import { useMultipleStorage } from './useStorage'

/**
 * Hook for Jira configuration management
 */
export function useJiraConfig() {
  const [values, updateValues] = useMultipleStorage(STORAGE_GROUPS.JIRA_CONFIG)

  console.log({ values })

  const clearJiraConfig = useCallback(() => {
    updateValues({
      JiraHost: '',
      JiraApiToken: '',
      JiraUserEmail: ''
    })
  }, [updateValues])

  const isConfigComplete = useCallback(() => {
    return !!(values.JiraHost && values.JiraApiToken && values.JiraUserEmail)
  }, [values])

  const getApiConfig = useCallback((): JiraApiConfig | null => {
    if (!isConfigComplete()) return null

    return {
      baseUrl: values.JiraHost ?? '',
      email: values.JiraUserEmail ?? '',
      apiToken: values.JiraApiToken ?? ''
    }
  }, [values, isConfigComplete])

  return {
    jiraHost: values.JiraHost ?? '',
    apiToken: values.JiraApiToken ?? '',
    userEmail: values.JiraUserEmail ?? '',
    clearJiraConfig,
    updateJiraConfig: updateValues,
    isConfigComplete: isConfigComplete(),
    getApiConfig
  }
}
