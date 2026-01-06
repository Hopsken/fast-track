import { vi } from 'vitest'

const mockBrowser = {
  runtime: {
    id: 'test-extension-id',
    getManifest: vi.fn().mockReturnValue({ background: {} }),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined)
    }
  },
  tabs: {
    query: vi.fn().mockResolvedValue([])
  }
}

// @ts-ignore
global.chrome = mockBrowser
// @ts-ignore
global.browser = mockBrowser

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = ResizeObserverMock

HTMLElement.prototype.scrollIntoView = vi.fn()
