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
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      // Simulate enter key
      globalThis.__hotkeyHandlers['enter']?.()

      expect(getValue).toHaveBeenCalled()
      expect(onConfirm).toHaveBeenCalledWith('test-value')
    })

    it('should not register enter when keys is meta+enter', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'meta+enter'
        })
      )

      expect(globalThis.__hotkeyHandlers['enter']).toBeUndefined()
    })

    it('should register enter when keys is both', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'both'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalledWith('test-value')
    })
  })

  describe('meta+enter key', () => {
    it('should confirm on meta+enter when keys is meta+enter', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'meta+enter'
        })
      )

      globalThis.__hotkeyHandlers['meta+enter']?.()

      expect(getValue).toHaveBeenCalled()
      expect(onConfirm).toHaveBeenCalledWith('test-value')
    })

    it('should not register meta+enter when keys is enter', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      expect(globalThis.__hotkeyHandlers['meta+enter']).toBeUndefined()
    })

    it('should register meta+enter when keys is both', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'both'
        })
      )

      globalThis.__hotkeyHandlers['meta+enter']?.()

      expect(onConfirm).toHaveBeenCalledWith('test-value')
    })
  })

  describe('skip pattern', () => {
    it('should not confirm when getValue returns { skip: true }', () => {
      const getValue = vi.fn(() => ({ skip: true }))
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(getValue).toHaveBeenCalled()
      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('should confirm with undefined value', () => {
      const getValue = vi.fn(() => undefined)
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalledWith(undefined)
    })

    it('should confirm with null value', () => {
      const getValue = vi.fn(() => null)
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalledWith(null)
    })

    it('should confirm with object that does not have skip property', () => {
      const getValue = vi.fn(() => ({ value: 'test' }))
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      globalThis.__hotkeyHandlers['enter']?.()

      expect(onConfirm).toHaveBeenCalledWith({ value: 'test' })
    })
  })

  describe('enabled option', () => {
    it('should not register hotkeys when enabled is false', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
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
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'none'
        })
      )

      expect(globalThis.__hotkeyHandlers['enter']).toBeUndefined()
      expect(globalThis.__hotkeyHandlers['meta+enter']).toBeUndefined()
    })

    it('should return manual confirm function', () => {
      const getValue = vi.fn(() => 'test-value')
      const onConfirm = vi.fn()

      const { result } = renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'none'
        })
      )

      result.current.confirm()

      expect(getValue).toHaveBeenCalled()
      expect(onConfirm).toHaveBeenCalledWith('test-value')
    })
  })

  describe('manual confirm', () => {
    it('should return confirm function that can be called manually', () => {
      const getValue = vi.fn(() => 'manual-value')
      const onConfirm = vi.fn()

      const { result } = renderHook(() =>
        useFieldConfirm({
          getValue,
          onConfirm,
          keys: 'enter'
        })
      )

      result.current.confirm()

      expect(getValue).toHaveBeenCalled()
      expect(onConfirm).toHaveBeenCalledWith('manual-value')
    })
  })

  describe('performance optimization', () => {
    it('should maintain stable confirm callback even when getValue changes', () => {
      const onConfirm = vi.fn()

      const { result, rerender } = renderHook(
        ({ value }) =>
          useFieldConfirm({
            // Inline function that changes on every render
            getValue: () => value,
            onConfirm,
            keys: 'enter'
          }),
        {
          initialProps: { value: 'first' }
        }
      )

      const firstConfirm = result.current.confirm

      // Re-render with new getValue function
      rerender({ value: 'second' })
      const secondConfirm = result.current.confirm

      // Confirm callback should be stable
      expect(firstConfirm).toBe(secondConfirm)

      // But should use latest getValue
      secondConfirm()
      expect(onConfirm).toHaveBeenCalledWith('second')
    })

    it('should call latest getValue even when passed as inline function', () => {
      const onConfirm = vi.fn()

      const { result, rerender } = renderHook(
        ({ search }) =>
          useFieldConfirm({
            getValue: () => search.trim(), // Inline function
            onConfirm,
            keys: 'enter'
          }),
        {
          initialProps: { search: '  first  ' }
        }
      )

      result.current.confirm()
      expect(onConfirm).toHaveBeenCalledWith('first')

      // Re-render with new search value
      rerender({ search: '  second  ' })

      result.current.confirm()
      expect(onConfirm).toHaveBeenCalledWith('second')
    })
  })
})
