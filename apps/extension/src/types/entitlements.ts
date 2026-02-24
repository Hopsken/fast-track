export type ExtensionAuthState = 'active' | 'relogin_required'

export type ExtensionAuth = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string | null
  }

  /** Optional for backwards compatibility; missing == active */
  state?: ExtensionAuthState
  /** Present when state === relogin_required */
  reloginReason?: 'refresh_token_rejected'
  reloginAt?: string
}

export type SubscriptionSnapshot = {
  status: string | null
  renewsAt: string | null
  endsAt: string | null
  updatedAt: string | null
  isPro: boolean
  lastCheckedAt: string
}
