import { getStorageItem } from '@/lib/storage'
import { JiraUserInfo } from '@/types'

/**
 * Get the current user from AuthCredentials
 * Note: This always fetches fresh from storage to avoid stale cache issues
 * after logout/re-authentication
 */
export async function getCurrentUser(): Promise<JiraUserInfo | null> {
  const credentials = await getStorageItem('AuthCredentials').getValue()
  return credentials?.userInfo ?? null
}
