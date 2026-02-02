import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFieldConfirm } from './useFieldConfirm'

// Extend globalThis for test hotkey handlers
declare global {
  var __hotkeyHandlers: Record<string, () => void>
}

// Mock react-hotkeys-hook
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn((key, handler, options) => {
    // Store handlers for manual triggering in tests
    if (!globalThis.__hotkeyHandlers) {
      globalThis.__hotkeyHandlers = {}
    }
    if (options?.enabled !== false) {
      globalThis.__hotkeyHandlers[key] = handler
    }
  })
}))

describe('useFieldConfirm', () => {
  beforeEach(() => {
    globalThis.__hotkeyHandlers = {}
  })

  describe('enter key', () => {
    it('should confirm on enter with default keys', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'enter'
        })
      )

      // Simulate enter key
      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })

    it('should not register enter when keys is meta+enter', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'meta+enter'
        })
      )

      expect(globalThis.__hotkeyHandlers['enter']).toBeUndefined()
    })

    it('should register enter when keys is both', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'both'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })
  })

  describe('meta+enter key', () => {
    it('should confirm on meta+enter when keys is meta+enter', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'meta+enter'
        })
      )

      globalThis.__hotkeyHandlers['meta+enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })

    it('should not register meta+enter when keys is enter', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'enter'
        })
      )

      expect(globalThis.__hotkeyHandlers['meta+enter']).toBeUndefined()
    })

    it('should register meta+enter when keys is both', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'both'
        })
      )

      globalThis.__hotkeyHandlers['meta+enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })
  })

  describe('skip pattern', () => {
    it('should confirm with undefined value', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })

    it('should confirm with null value', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalled()
    })
  })

  describe('enabled option', () => {
    it('should not register hotkeys when enabled is false', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'enter',
          enabled: false
        })
      )

      expect(globalThis.__hotkeyHandlers['enter']).toBeUndefined()
    })
  })

  describe('keys: none', () => {
    it('should not register any hotkeys when keys is none', () => {
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          onConfirm,
          keys: 'none'
        })
      )

      expect(globalThis.__hotkeyHandlers['enter']).toBeUndefined()
      expect(globalThis.__hotkeyHandlers['meta+enter']).toBeUndefined()
    })
  })
})
