import { createContext, useContext, useMemo } from 'react'

import { useStorage } from '@/hooks'
import { JiraUserInfo } from '@/types'
import { isValidCredentials } from '@/utils/auth'

type Context = {
  userInfo: JiraUserInfo | null
  isConfigured: boolean | null
}

const UserContext = createContext<Context>({
  userInfo: null,
  isConfigured: null
})

export function UserContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
  const [credentials, _, state] = useStorage('AuthCredentials')
  const value = useMemo(
    () => ({
      userInfo: state !== 'pending' ? (credentials?.userInfo ?? null) : null,
      isConfigured: state !== 'pending' ? isValidCredentials(credentials) : null
    }),
    [credentials, state]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useCurrentUser() {
  const { userInfo } = useContext(UserContext)

  return userInfo
}

export function useIsAuthConfigured() {
  const { isConfigured } = useContext(UserContext)

  return isConfigured
}

export function useCurrentUserOrThrow() {
  const userInfo = useCurrentUser()

  if (!userInfo) {
    throw new Error('Current user not found')
  }

  return userInfo
}
