import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { useStorage } from '~/hooks'
import type { UserPreferences } from '~/types'

type UserPreferencesContextValue = {
  preferences: UserPreferences
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
}

const UserPreferencesContext =
  createContext<UserPreferencesContextValue | null>(null)

export function UserPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useStorage('UserPreferences')

  const setPreference: UserPreferencesContextValue['setPreference'] = <
    K extends keyof UserPreferences
  >(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const value = useMemo(
    () => ({
      preferences,
      setPreference
    }),
    [preferences]
  )

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)

  if (!context) {
    throw new Error(
      'useUserPreferences must be used within UserPreferencesProvider'
    )
  }

  return context
}
