import { isAllowedLemonSqueezyUrl } from './url'

type SubscriptionRetrieveResponse = {
  data?: {
    attributes?: {
      urls?: {
        customer_portal?: string | null
      } | null
    } | null
  } | null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export async function fetchLemonSqueezyCustomerPortalUrlForSubscription(options: {
  apiKey: string
  subscriptionId: string
  fetchFn?: typeof fetch
}): Promise<string> {
  const fetchFn = options.fetchFn ?? fetch

  const response = await fetchFn(
    `https://api.lemonsqueezy.com/v1/subscriptions/${options.subscriptionId}`,
    {
      method: 'GET',
      // Force a fresh signed URL. Next.js extended fetch may cache by default.
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${options.apiKey}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve LemonSqueezy subscription: ${response.status}`
    )
  }

  const json = (await response.json()) as SubscriptionRetrieveResponse
  const portalUrl = json?.data?.attributes?.urls?.customer_portal

  if (!isNonEmptyString(portalUrl)) {
    throw new Error('Missing customer portal url on LemonSqueezy subscription')
  }

  if (!isAllowedLemonSqueezyUrl(portalUrl)) {
    throw new Error('Invalid LemonSqueezy customer portal url')
  }

  return portalUrl
}
