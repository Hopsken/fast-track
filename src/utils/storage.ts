export type DarkModeVariant = "always" | "auto" | "disable"

const darkMode = storage.defineItem<DarkModeVariant>(`sync:dark-mode`, {
  fallback: "disable"
})

const colorfulCard = storage.defineItem<boolean>(`sync:color-card`, {
  fallback: false
})

const autoFullScreen = storage.defineItem<boolean>(`sync:auto-fullscreen`, {
  fallback: false
})

export type CustomBackground = {
  id: string
  url: string
  thumb_url: string
  instance_id: string
}

const customBackground = storage.defineItem<CustomBackground | undefined>(
  `sync:custom-background`,
  {
    fallback: undefined
  }
)

export type LicenseState = {
  valid: boolean
  license: string
  lastChecked: string
}

const license = storage.defineItem<LicenseState | undefined>(
  `sync:ls-license`,
  {
    fallback: undefined
  }
)

const jiraUrl = storage.defineItem<string | undefined>(`sync:jira-url`, {
  fallback: undefined
})

const primaryIssueKeyPrefix = storage.defineItem<string | undefined>(
  `sync:primary-issue-key-prefix`,
  {
    fallback: undefined
  }
)

export const persistLayer = {
  darkMode,
  colorfulCard,
  autoFullScreen,
  customBackground,
  license,
  jiraUrl,
  primaryIssueKeyPrefix
}
