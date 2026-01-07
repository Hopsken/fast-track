import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useStorage } from '~/hooks'
import type { UserPreferences } from '~/types'

type SetPreference = <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
) => void

type UserPreferencesContextValue = [UserPreferences, SetPreference]

const UserPreferencesContext =
  createContext<UserPreferencesContextValue | null>(null)

export function UserPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useStorage('UserPreferences')

  const setPreference: SetPreference = useMemoizedFn((key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }))
  })

  const value = useMemo<UserPreferencesContextValue>(
    () => [preferences, setPreference],
    [preferences, setPreference]
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
