import { z } from 'zod'

export const JiraAvatarUrlSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const preferredKeys = ['48x48', '32x32', '24x24', '16x16']
    for (const key of preferredKeys) {
      const candidate = record[key]
      if (typeof candidate === 'string') {
        return candidate
      }
    }

    const fallback = Object.values(record).find(
      (candidate) => typeof candidate === 'string'
    )
    if (typeof fallback === 'string') {
      return fallback
    }
  }

  return value
}, z.string())

const toDisplayName = (rec: Record<string, unknown>): string => {
  return (
    (typeof rec.displayName === 'string' ? rec.displayName : undefined) ??
    (typeof rec.name === 'string' ? rec.name : undefined) ??
    (typeof rec.emailAddress === 'string' ? rec.emailAddress : undefined) ??
    'Anonymous'
  )
}

export const JiraUserSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== 'object') return value

    const record = value as Record<string, unknown>
    const displayName = toDisplayName(record)

    return {
      accountId: typeof record.accountId === 'string' ? record.accountId : '',
      displayName,
      emailAddress:
        typeof record.emailAddress === 'string'
          ? record.emailAddress
          : undefined,
      avatarUrl: record.avatarUrls ?? record.avatarUrl
    }
  },
  z
    .object({
      accountId: z.string(),
      displayName: z.string(),
      emailAddress: z.string().nullable().optional(),
      avatarUrl: JiraAvatarUrlSchema
    })
    .strip()
)

export type JiraUser = z.infer<typeof JiraUserSchema>
