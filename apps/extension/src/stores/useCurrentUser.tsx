import { createContext, useContext } from 'react'

import { useStorage } from '@/hooks'
import { JiraUserInfo } from '@/types'

type Context = {
  userInfo: JiraUserInfo | null
}

const UserContext = createContext<Context>({ userInfo: null })

export function UserContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [userInfo] = useStorage('OAuthUserInfo')

  return (
    <UserContext.Provider value={{ userInfo }}>{children}</UserContext.Provider>
  )
}

export function useCurrentUser() {
  const { userInfo } = useContext(UserContext)

  return userInfo
}

export function useCurrentUserOrThrow() {
  const userInfo = useCurrentUser()

  if (!userInfo) {
    throw new Error('Current user not found')
  }

  return userInfo
}
