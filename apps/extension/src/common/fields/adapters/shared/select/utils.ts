import { z } from 'zod'

const iconicSchema = z.object({
  iconUrl: z.string().optional(),
  avatarUrl: z.string().optional()
})

export const getIconUrl = (val: unknown) => {
  const { data } = iconicSchema.safeParse(val)
  return data?.iconUrl ?? data?.avatarUrl ?? ''
}
