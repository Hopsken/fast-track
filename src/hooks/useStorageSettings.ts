/**
 * Hooks for settings management
 */

import { useCallback } from 'react'

import { useStorage, useMultipleStorage } from './useStorage'

import { StorageKey, STORAGE_GROUPS } from '~/storage/keys'
import type {
  DarkModeOption,
  CustomBackground,
  JiraApiConfig
} from '~/storage/types'

/**
 * Hook for UI settings management
 */
export function useUISettings() {
  const [values, updateValues] = useMultipleStorage(STORAGE_GROUPS.UI_SETTINGS)

  const setDarkMode = useCallback(
    (mode: DarkModeOption) => {
      updateValues({ [StorageKey.DarkMode]: mode })
    },
    [updateValues]
  )

  const toggleColorCard = useCallback(() => {
    updateValues({ [StorageKey.ColorCard]: !values[StorageKey.ColorCard] })
  }, [updateValues, values])

  const toggleAutoFullScreen = useCallback(() => {
    updateValues({
      [StorageKey.AutoFullScreen]: !values[StorageKey.AutoFullScreen]
    })
  }, [updateValues, values])

  const setCustomBackground = useCallback(
    (background: CustomBackground | undefined) => {
      updateValues({ [StorageKey.CustomBackground]: background })
    },
    [updateValues]
  )

  return {
    darkMode: values[StorageKey.DarkMode] ?? 'auto',
    colorCard: values[StorageKey.ColorCard] ?? false,
    autoFullScreen: values[StorageKey.AutoFullScreen] ?? false,
    customBackground: values[StorageKey.CustomBackground],
    setDarkMode,
    toggleColorCard,
    toggleAutoFullScreen,
    setCustomBackground
  }
}

/**
 * Hook for Jira configuration management
 */
export function useJiraConfig() {
  const [values, updateValues] = useMultipleStorage(STORAGE_GROUPS.JIRA_CONFIG)

  const updateJiraConfig = useCallback(
    (config: Partial<JiraApiConfig>) => {
      const updates: Partial<{ [key in StorageKey]: any }> = {}

      if (config.host !== undefined) {
        updates[StorageKey.JiraHost] = config.host
        updates[StorageKey.JiraUrl] = config.host // Keep both for compatibility
      }
      if (config.email !== undefined) {
        updates[StorageKey.JiraUserEmail] = config.email
      }
      if (config.token !== undefined) {
        updates[StorageKey.JiraApiToken] = config.token
      }

      updateValues(updates)
    },
    [updateValues]
  )

  const clearJiraConfig = useCallback(() => {
    updateValues({
      [StorageKey.JiraHost]: '',
      [StorageKey.JiraUrl]: '',
      [StorageKey.JiraApiToken]: '',
      [StorageKey.JiraUserEmail]: ''
    })
  }, [updateValues])

  const isConfigComplete = useCallback(() => {
    return !!(
      values[StorageKey.JiraHost] &&
      values[StorageKey.JiraApiToken] &&
      values[StorageKey.JiraUserEmail]
    )
  }, [values])

  const getApiConfig = useCallback((): JiraApiConfig | null => {
    if (!isConfigComplete()) return null

    return {
      host: values[StorageKey.JiraHost] ?? '',
      email: values[StorageKey.JiraUserEmail] ?? '',
      token: values[StorageKey.JiraApiToken] ?? ''
    }
  }, [values, isConfigComplete])

  return {
    jiraHost: values[StorageKey.JiraHost] ?? '',
    jiraUrl: values[StorageKey.JiraUrl] ?? '', // For compatibility
    apiToken: values[StorageKey.JiraApiToken] ?? '',
    userEmail: values[StorageKey.JiraUserEmail] ?? '',
    updateJiraConfig,
    clearJiraConfig,
    isConfigComplete: isConfigComplete(),
    getApiConfig
  }
}

/**
 * Hook for user preferences
 */
export function useUserPreferences() {
  const [primaryIssueKeyPrefix, setPrimaryIssueKeyPrefix] = useStorage(
    StorageKey.PrimaryIssueKeyPrefix,
    ''
  )

  return {
    primaryIssueKeyPrefix,
    setPrimaryIssueKeyPrefix
  }
}

/**
 * Hook for license information
 */
export function useLicenseSettings() {
  const [license, setLicense] = useStorage(StorageKey.License, null)

  const isLicenseValid = useCallback(() => {
    return license?.valid ?? false
  }, [license])

  const isLicenseExpired = useCallback(() => {
    if (!license?.lastChecked) return true

    const lastChecked = new Date(license.lastChecked)
    const now = new Date()
    const daysSinceCheck =
      (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60 * 24)

    return daysSinceCheck > 7 // Consider expired if not checked in 7 days
  }, [license])

  return {
    license,
    setLicense,
    isLicenseValid: isLicenseValid(),
    isLicenseExpired: isLicenseExpired(),
    hasLicense: license !== null
  }
}
