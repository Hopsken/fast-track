import { getStorageItem } from '@/lib/storage'
import { JiraUserInfo } from '@/types'

let userInfo: JiraUserInfo

export async function getCurrentUser() {
  userInfo = userInfo || getStorageItem('OAuthUserInfo').getValue() || {}
  return userInfo
}
