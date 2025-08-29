/**
 * Storage keys enum and constants
 */

export enum StorageKey {
  // UI Settings
  DarkMode = "dark-mode",
  ColorCard = "color-card",
  AutoFullScreen = "auto-fullscreen",
  CustomBackground = "custom-background",
  
  // License
  License = "ls-license",
  
  // Jira Configuration
  JiraUrl = "jira-url",
  JiraHost = "jira-host",
  JiraApiToken = "jira-api-token",
  JiraUserEmail = "jira-user-email",
  
  // User Preferences
  PrimaryIssueKeyPrefix = "primary-issue-key-prefix",
  
  // Data
  TicketsData = "tickets-data",
  SearchHistory = "search-history",
  TicketViewHistory = "ticket-view-history",
}

// Storage key groups for organization
export const STORAGE_GROUPS = {
  UI_SETTINGS: [
    StorageKey.DarkMode,
    StorageKey.ColorCard,
    StorageKey.AutoFullScreen,
    StorageKey.CustomBackground,
  ],
  JIRA_CONFIG: [
    StorageKey.JiraUrl,
    StorageKey.JiraHost,
    StorageKey.JiraApiToken,
    StorageKey.JiraUserEmail,
  ],
  USER_DATA: [
    StorageKey.TicketsData,
    StorageKey.SearchHistory,
    StorageKey.TicketViewHistory,
  ],
  PREFERENCES: [
    StorageKey.PrimaryIssueKeyPrefix,
  ],
  LICENSE: [
    StorageKey.License,
  ],
} as const