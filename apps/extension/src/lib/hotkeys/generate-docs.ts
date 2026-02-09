/**
 * Generates markdown documentation from the hotkey registry.
 * Run with: tsx src/lib/hotkeys/generate-docs.ts > docs/HOTKEYS.md
 */

import { PlatformOS, resolvePlatformShortcut } from '@/lib/keyboard'

import { HOTKEY_REGISTRY, getHotkeysByCategory } from './registry'
import type { HotkeyCategory } from './types'

/**
 * Format a shortcut for display.
 */
function formatShortcut(hotkeyId: string, platform: PlatformOS): string {
  const hotkey = HOTKEY_REGISTRY[hotkeyId as keyof typeof HOTKEY_REGISTRY]
  const shortcut = resolvePlatformShortcut(hotkey.shortcut, platform)

  const modifiers = shortcut.modifiers.map((m) => {
    if (m === 'cmd') return platform === 'macOS' ? 'Cmd' : 'Ctrl'
    if (m === 'opt') return platform === 'macOS' ? 'Opt' : 'Alt'
    if (m === 'shift') return 'Shift'
    if (m === 'ctrl') return 'Ctrl'
    if (m === 'alt') return 'Alt'
    return m
  })

  const key = shortcut.key === 'enter' ? 'Enter' : shortcut.key.toUpperCase()

  if (modifiers.length === 0) {
    return key
  }

  return `${modifiers.join('+')}+${key}`
}

/**
 * Generate markdown table for a category.
 */
function generateCategoryTable(
  category: HotkeyCategory,
  platform: PlatformOS
): string {
  const hotkeys = getHotkeysByCategory(category)

  if (hotkeys.length === 0) {
    return ''
  }

  const categoryTitle = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const lines: string[] = [
    `### ${categoryTitle}`,
    '',
    '| Hotkey | Description | Scopes |',
    '|--------|-------------|--------|'
  ]

  for (const hotkey of hotkeys) {
    const shortcut = formatShortcut(hotkey.id, platform)
    const scopes = hotkey.scopes.map((s) => `\`${s}\``).join(', ')

    lines.push(`| \`${shortcut}\` | ${hotkey.description} | ${scopes} |`)
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Generate full documentation.
 */
function generateDocs(): string {
  const lines: string[] = [
    '# Keyboard Shortcuts',
    '',
    'This document is auto-generated from the hotkey registry.',
    '',
    '## macOS',
    ''
  ]

  const categories: HotkeyCategory[] = [
    'navigation',
    'field-input',
    'issue-actions',
    'clipboard',
    'global'
  ]

  for (const category of categories) {
    lines.push(generateCategoryTable(category, 'macOS'))
  }

  lines.push('', '## Windows', '')

  for (const category of categories) {
    lines.push(generateCategoryTable(category, 'Windows'))
  }

  return lines.join('\n')
}

// Output to stdout
console.log(generateDocs())
