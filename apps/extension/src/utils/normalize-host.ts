/**
 * Normalize a Jira base URL (or host) into a hostname-only string.
 *
 * Examples:
 * - "https://xxx.atlassian.net" -> "xxx.atlassian.net"
 * - "xxx.atlassian.net" -> "xxx.atlassian.net"
 * - "https://xxx.atlassian.net/browse/PROJ" -> "xxx.atlassian.net"
 */
export function normalizeBaseUrlHost(input: string): string {
  const raw = input.trim()
  if (!raw) return ''

  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`)
    return url.hostname.toLowerCase()
  } catch {
    return ''
  }
}
