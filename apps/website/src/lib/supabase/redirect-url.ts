export function sanitizeNextPath(
  next: string | null | undefined
): string | null {
  if (!next) return null

  const trimmed = next.trim()
  if (!trimmed) return null

  // Only allow same-origin relative paths.
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  if (trimmed.includes('://')) return null

  return trimmed
}

export function buildAuthCallbackUrl(
  websiteUrl: string,
  next?: string | null
): string {
  const base = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl
  const callback = `${base}/auth/callback`

  const safeNext = sanitizeNextPath(next)
  if (!safeNext) return callback

  const url = new URL(callback)
  url.searchParams.set('next', safeNext)
  return url.toString()
}
