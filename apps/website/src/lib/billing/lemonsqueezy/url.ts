export function parseLemonSqueezyUrl(value: string): URL {
  const url = new URL(value)

  if (url.protocol !== 'https:') {
    throw new Error('LemonSqueezy URL must use https')
  }

  const hostname = url.hostname.toLowerCase()
  const isAllowedHost =
    hostname === 'lemonsqueezy.com' || hostname.endsWith('.lemonsqueezy.com')

  if (!isAllowedHost) {
    throw new Error('LemonSqueezy URL must be on lemonsqueezy.com')
  }

  if (url.username || url.password) {
    throw new Error('LemonSqueezy URL must not include credentials')
  }

  return url
}

export function isAllowedLemonSqueezyUrl(value: string): boolean {
  try {
    parseLemonSqueezyUrl(value)
    return true
  } catch {
    return false
  }
}
