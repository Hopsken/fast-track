export function buildAuthCallbackUrl(websiteUrl: string): string {
  const base = websiteUrl.endsWith('/') ? websiteUrl.slice(0, -1) : websiteUrl
  return `${base}/auth/callback`
}
