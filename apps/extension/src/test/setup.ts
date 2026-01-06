import { vi } from 'vitest'

// Fix Uint8Array issue in jsdom/happy-dom for esbuild
if (typeof window !== 'undefined' && typeof window.Uint8Array !== 'undefined') {
  global.Uint8Array = window.Uint8Array
}

// Mock browser APIs that fake-browser might miss or throw on
const mockBrowser = {
  runtime: {
    id: 'test-extension-id',
    getManifest: vi.fn().mockReturnValue({ background: {} }),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockReturnValue({
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
      onDisconnect: { addListener: vi.fn(), removeListener: vi.fn() },
      postMessage: vi.fn(),
      disconnect: vi.fn()
    }),
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

if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = vi.fn()
}
