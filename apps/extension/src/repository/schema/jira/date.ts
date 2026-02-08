import { z } from 'zod'

// +0800 -> +08:00
const normalizeOffset = (s: string) => s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')

export const JiraDateTimeSchema = z
  .string()
  .trim()
  .transform(normalizeOffset)
  .pipe(z.iso.datetime({ offset: true })) // now it validates as ISO
