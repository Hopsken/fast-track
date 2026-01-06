import { vi } from 'vitest'

export const analytics = {
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  reset: vi.fn()
}
