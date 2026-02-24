import crypto from 'node:crypto'

export const LINK_CODE_TTL_MS = 5 * 60 * 1000

export function generateLinkCode(): string {
  // URL-safe + easy to recognize in logs
  const rand = crypto.randomBytes(24).toString('base64url')
  return `ft_link_${rand}`
}

export function hashLinkCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export function computeLinkCodeExpiry(now = new Date()): Date {
  return new Date(now.getTime() + LINK_CODE_TTL_MS)
}
