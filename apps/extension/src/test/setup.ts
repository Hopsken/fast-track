import { vi } from 'vitest'

vi.mock('@wxt-dev/analytics', () => ({
  createAnalytics: () => ({
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    reset: vi.fn()
  })
}))

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      id: 'test-extension-id',
      getManifest: vi.fn().mockReturnValue({ version: '0.0.0' })
    }
  }
}))

// Fix Uint8Array issue in jsdom/happy-dom for esbuild
if (typeof window !== 'undefined' && typeof window.Uint8Array !== 'undefined') {
  global.Uint8Array = window.Uint8Array
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalAny.ResizeObserver = ResizeObserverMock

if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = vi.fn()
}
