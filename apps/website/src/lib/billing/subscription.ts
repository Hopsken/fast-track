export type BillingSubscription = {
  status: string
  endsAt?: string | null
}

export function isProFromSubscription(
  subscription: BillingSubscription | null
): boolean {
  if (!subscription) return false

  const status = subscription.status

  if (status === 'active' || status === 'on_trial') return true

  if (status === 'cancelled' && subscription.endsAt) {
    const endsAt = new Date(subscription.endsAt)
    if (!Number.isNaN(endsAt.getTime())) {
      return endsAt.getTime() > Date.now()
    }
  }

  return false
}
