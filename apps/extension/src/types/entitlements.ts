export type ExtensionAuth = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string | null
  }
}

export type SubscriptionSnapshot = {
  status: string | null
  renewsAt: string | null
  endsAt: string | null
  updatedAt: string | null
  isPro: boolean
  lastCheckedAt: string
}
