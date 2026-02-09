import {
  PlatformOS,
  KeyboardShortcut,
  resolvePlatformShortcut
} from '@/lib/keyboard'

import { HOTKEY_REGISTRY, HotkeyId } from './registry'
import type { HotkeyDefinition, HotkeyScope } from './types'

/**
 * Represents a conflict between two hotkeys.
 */
export interface ConflictReport {
  /** The conflicting hotkey combination (e.g., "cmd+shift+a") */
  keys: string
  /** Scopes where the conflict occurs */
  conflictingScopes: HotkeyScope[]
  /** Hotkeys involved in the conflict */
  hotkeys: Array<{
    id: HotkeyId
    scopes: HotkeyScope[]
    priority: number
    description: string
  }>
}

/**
 * Converts a keyboard shortcut to a normalized key string for comparison.
 */
function shortcutToKeyString(shortcut: KeyboardShortcut): string {
  const sortedModifiers = [...shortcut.modifiers].sort()
  return [...sortedModifiers, shortcut.key].join('+')
}

/**
 * Finds all overlapping scopes between two hotkey definitions.
 */
function findOverlappingScopes(
  scopes1: HotkeyScope[],
  scopes2: HotkeyScope[]
): HotkeyScope[] {
  return scopes1.filter((scope) => scopes2.includes(scope))
}

/**
 * Detects conflicting hotkey bindings for a specific platform.
 *
 * A conflict occurs when:
 * 1. Two hotkeys have the same key combination
 * 2. They share at least one common scope
 * 3. They have the same priority (higher priority wins)
 *
 * @param platform - Target platform to check
 * @returns Array of conflict reports
 */
export function detectConflicts(platform: PlatformOS): ConflictReport[] {
  const conflicts: ConflictReport[] = []
  const hotkeyList = Object.values(HOTKEY_REGISTRY)

  // Build a map of key strings to hotkeys for efficient lookup
  const keyToHotkeys = new Map<
    string,
    Array<{
      id: HotkeyId
      definition: HotkeyDefinition
      shortcut: KeyboardShortcut
    }>
  >()

  // Resolve platform-specific shortcuts and group by key string
  for (const hotkey of hotkeyList) {
    const resolvedShortcut = resolvePlatformShortcut(hotkey.shortcut, platform)
    const keyString = shortcutToKeyString(resolvedShortcut)

    if (!keyToHotkeys.has(keyString)) {
      keyToHotkeys.set(keyString, [])
    }

    keyToHotkeys.get(keyString)!.push({
      id: hotkey.id as HotkeyId,
      definition: hotkey,
      shortcut: resolvedShortcut
    })
  }

  // Check each group of hotkeys with the same key combination
  for (const [keyString, hotkeys] of keyToHotkeys.entries()) {
    if (hotkeys.length < 2) {
      continue // No conflict if only one hotkey uses this combination
    }

    // Check all pairs for scope overlap
    for (let i = 0; i < hotkeys.length; i++) {
      for (let j = i + 1; j < hotkeys.length; j++) {
        const hotkey1 = hotkeys[i]
        const hotkey2 = hotkeys[j]

        // TypeScript null safety (hotkeys accessed within bounds)
        if (!hotkey1 || !hotkey2) continue

        const overlappingScopes = findOverlappingScopes(
          hotkey1.definition.scopes,
          hotkey2.definition.scopes
        )

        if (overlappingScopes.length > 0) {
          const priority1 = hotkey1.definition.priority ?? 5
          const priority2 = hotkey2.definition.priority ?? 5

          // Only report as conflict if priorities are equal
          // (higher priority wins, so no conflict)
          if (priority1 === priority2) {
            // Check if we already have a conflict report for this key string
            let existingConflict = conflicts.find((c) => c.keys === keyString)

            if (!existingConflict) {
              existingConflict = {
                keys: keyString,
                conflictingScopes: [],
                hotkeys: []
              }
              conflicts.push(existingConflict)
            }

            // Add overlapping scopes
            for (const scope of overlappingScopes) {
              if (!existingConflict.conflictingScopes.includes(scope)) {
                existingConflict.conflictingScopes.push(scope)
              }
            }

            // Add hotkeys if not already present
            const addHotkeyToReport = (
              hotkey: typeof hotkey1 | typeof hotkey2
            ) => {
              if (!hotkey) return
              if (!existingConflict!.hotkeys.find((h) => h.id === hotkey.id)) {
                existingConflict!.hotkeys.push({
                  id: hotkey.id,
                  scopes: hotkey.definition.scopes,
                  priority: hotkey.definition.priority ?? 5,
                  description: hotkey.definition.description
                })
              }
            }

            addHotkeyToReport(hotkey1)
            addHotkeyToReport(hotkey2)
          }
        }
      }
    }
  }

  return conflicts
}

/**
 * Formats conflict reports as human-readable text.
 */
export function formatConflictReport(conflicts: ConflictReport[]): string {
  if (conflicts.length === 0) {
    return 'No conflicts detected ✓'
  }

  const lines: string[] = [`Found ${conflicts.length} conflict(s):`, '']

  for (const conflict of conflicts) {
    lines.push(`Conflict: ${conflict.keys}`)
    lines.push(`  Conflicting scopes: ${conflict.conflictingScopes.join(', ')}`)
    lines.push(`  Hotkeys:`)

    for (const hotkey of conflict.hotkeys) {
      lines.push(`    - ${hotkey.id}`)
      lines.push(`      Scopes: ${hotkey.scopes.join(', ')}`)
      lines.push(`      Priority: ${hotkey.priority}`)
      lines.push(`      Description: ${hotkey.description}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Throws an error if any conflicts are detected.
 * Useful for build-time validation.
 */
export function assertNoConflicts(platform: PlatformOS): void {
  const conflicts = detectConflicts(platform)

  if (conflicts.length > 0) {
    throw new Error(
      `Hotkey conflicts detected for ${platform}:\n\n${formatConflictReport(conflicts)}`
    )
  }
}
