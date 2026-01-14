import { getStorageItem } from '@/lib/storage'
import { JiraUserInfo } from '@/types'

let userInfo: JiraUserInfo | null = null

export async function getCurrentUser(): Promise<JiraUserInfo | null> {
  if (userInfo) return userInfo

  const credentials = await getStorageItem('AuthCredentials').getValue()
  userInfo = credentials?.userInfo ?? null
  return userInfo
}
