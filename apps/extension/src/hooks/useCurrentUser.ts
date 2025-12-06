import { useStorage } from './useStorage'

export function useCurrentUser() {
  const [userInfo] = useStorage('OAuthUserInfo')

  return userInfo
}

export function useCurrentUserOrThrow() {
  const userInfo = useCurrentUser()

  if (!userInfo) {
    throw new Error('Current user not found')
  }

  return userInfo
}
