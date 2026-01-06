import { vi } from 'vitest'

export const storage = {
  defineItem: vi.fn().mockReturnValue({
    getValue: vi.fn().mockResolvedValue(null),
    setValue: vi.fn().mockResolvedValue(undefined),
    removeValue: vi.fn().mockResolvedValue(undefined),
    watch: vi.fn().mockReturnValue(() => {})
  })
}

export const browser = {
  runtime: {
    id: 'test-extension-id',
    getManifest: vi.fn().mockReturnValue({ background: {} }),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  tabs: {
    query: vi.fn().mockResolvedValue([])
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined)
    }
  }
}

export const analytics = {
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  reset: vi.fn()
}

export const defineProxyService = vi.fn().mockReturnValue([vi.fn(), vi.fn()])
