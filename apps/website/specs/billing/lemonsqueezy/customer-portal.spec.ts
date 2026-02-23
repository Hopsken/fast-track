import { describe, expect, it } from 'vitest'

import { fetchLemonSqueezyCustomerPortalUrlForSubscription } from '../../../src/lib/billing/lemonsqueezy/customer-portal'

describe('fetchLemonSqueezyCustomerPortalUrlForSubscription', () => {
  it('returns the signed customer portal url from subscription retrieve endpoint', async () => {
    const fetchFn = async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(
        'https://api.lemonsqueezy.com/v1/subscriptions/sub_123'
      )

      expect(init?.headers).toMatchObject({
        Accept: 'application/vnd.api+json',
        Authorization: 'Bearer api_test'
      })

      return new Response(
        JSON.stringify({
          data: {
            attributes: {
              urls: {
                customer_portal:
                  'https://teamusement.lemonsqueezy.com/billing?expires=1&user=2&signature=3'
              }
            }
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      )
    }

    await expect(
      fetchLemonSqueezyCustomerPortalUrlForSubscription({
        apiKey: 'api_test',
        subscriptionId: 'sub_123',
        fetchFn
      })
    ).resolves.toBe(
      'https://teamusement.lemonsqueezy.com/billing?expires=1&user=2&signature=3'
    )
  })

  it('throws when the API returns a null portal url', async () => {
    const fetchFn = async () =>
      new Response(
        JSON.stringify({
          data: { attributes: { urls: { customer_portal: null } } }
        }),
        { status: 200 }
      )

    await expect(
      fetchLemonSqueezyCustomerPortalUrlForSubscription({
        apiKey: 'api_test',
        subscriptionId: 'sub_123',
        fetchFn
      })
    ).rejects.toThrow(/customer portal/i)
  })

  it('throws when the API returns a url outside lemonsqueezy.com', async () => {
    const fetchFn = async () =>
      new Response(
        JSON.stringify({
          data: {
            attributes: {
              urls: { customer_portal: 'https://evil.com/billing?x=1' }
            }
          }
        }),
        { status: 200 }
      )

    await expect(
      fetchLemonSqueezyCustomerPortalUrlForSubscription({
        apiKey: 'api_test',
        subscriptionId: 'sub_123',
        fetchFn
      })
    ).rejects.toThrow(/lemonsqueezy/i)
  })
})
