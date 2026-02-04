import { describe, it, expect } from 'vitest'

import { detectConflicts, formatConflictReport } from './conflict-detector'
import {
  HOTKEY_REGISTRY,
  getHotkeyDefinition,
  getHotkeysByScope,
  getHotkeysByCategory
} from './registry'

describe('Hotkey Registry', () => {
  describe('conflict detection', () => {
    it('should not have conflicts on macOS', () => {
      const conflicts = detectConflicts('macOS')
      expect(conflicts, formatConflictReport(conflicts)).toEqual([])
    })

    it('should not have conflicts on Windows', () => {
      const conflicts = detectConflicts('Windows')
      expect(conflicts, formatConflictReport(conflicts)).toEqual([])
    })
  })

  describe('registry structure', () => {
    it('should have unique IDs', () => {
      const ids = Object.keys(HOTKEY_REGISTRY)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have all IDs matching their key', () => {
      for (const [key, hotkey] of Object.entries(HOTKEY_REGISTRY)) {
        expect(hotkey.id).toBe(key)
      }
    })

    it('should have valid scopes for all hotkeys', () => {
      const validScopes = [
        'global',
        'main-menu',
        'issue-menu',
        'issue-actions',
        'create-issue',
        'field-input'
      ]

      for (const hotkey of Object.values(HOTKEY_REGISTRY)) {
        expect(hotkey.scopes.length).toBeGreaterThan(0)
        for (const scope of hotkey.scopes) {
          expect(validScopes).toContain(scope)
        }
      }
    })

    it('should have valid categories for all hotkeys', () => {
      const validCategories = [
        'navigation',
        'field-input',
        'issue-actions',
        'clipboard',
        'global'
      ]

      for (const hotkey of Object.values(HOTKEY_REGISTRY)) {
        expect(validCategories).toContain(hotkey.category)
      }
    })

    it('should have descriptions for all hotkeys', () => {
      for (const hotkey of Object.values(HOTKEY_REGISTRY)) {
        expect(hotkey.description).toBeTruthy()
        expect(hotkey.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getHotkeyDefinition', () => {
    it('should return correct definition for valid ID', () => {
      const definition = getHotkeyDefinition('global.escape')
      expect(definition).toBeDefined()
      expect(definition.id).toBe('global.escape')
      expect(definition.scopes).toContain('global')
    })
  })

  describe('getHotkeysByScope', () => {
    it('should return all global hotkeys', () => {
      const globalHotkeys = getHotkeysByScope('global')
      expect(globalHotkeys.length).toBeGreaterThan(0)
      for (const hotkey of globalHotkeys) {
        expect(hotkey.scopes).toContain('global')
      }
    })

    it('should return all field-input hotkeys', () => {
      const fieldHotkeys = getHotkeysByScope('field-input')
      expect(fieldHotkeys.length).toBeGreaterThan(0)
      for (const hotkey of fieldHotkeys) {
        expect(hotkey.scopes).toContain('field-input')
      }
    })

    it('should return all issue-menu hotkeys', () => {
      const issueHotkeys = getHotkeysByScope('issue-menu')
      expect(issueHotkeys.length).toBeGreaterThan(0)
      for (const hotkey of issueHotkeys) {
        expect(hotkey.scopes).toContain('issue-menu')
      }
    })
  })

  describe('getHotkeysByCategory', () => {
    it('should return all navigation hotkeys', () => {
      const navHotkeys = getHotkeysByCategory('navigation')
      expect(navHotkeys.length).toBeGreaterThan(0)
      for (const hotkey of navHotkeys) {
        expect(hotkey.category).toBe('navigation')
      }
    })

    it('should return all clipboard hotkeys', () => {
      const clipboardHotkeys = getHotkeysByCategory('clipboard')
      expect(clipboardHotkeys.length).toBeGreaterThan(0)
      for (const hotkey of clipboardHotkeys) {
        expect(hotkey.category).toBe('clipboard')
      }
    })
  })

  describe('priority system', () => {
    it('should allow enter and cmd+enter to coexist (different modifiers)', () => {
      const simple = getHotkeyDefinition('field.confirm-simple')
      const complex = getHotkeyDefinition('field.confirm-complex')

      // Both target field-input scope
      expect(simple.scopes).toContain('field-input')
      expect(complex.scopes).toContain('field-input')

      // Different key combinations (enter vs cmd+enter)
      // This should NOT conflict because modifiers are different
      const conflicts = detectConflicts('macOS')
      expect(conflicts).toEqual([])
    })
  })
})
