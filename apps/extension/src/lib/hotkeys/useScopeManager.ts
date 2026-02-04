import { useEffect } from 'react'
import { useHotkeysContext } from 'react-hotkeys-hook'
import { useLocation } from 'react-router-dom'

import { HotkeyScope } from './registry'

/**
 * Maps route patterns to hotkey scopes that should be active.
 * Routes are checked in order, first match wins.
 */
const ROUTE_SCOPE_MAP: Array<{
  pattern: RegExp
  scopes: HotkeyScope[]
}> = [
  // Root menu
  {
    pattern: /^\/$/,
    scopes: ['global', 'main-menu']
  },
  // Issue menu and submenus
  {
    pattern: /^\/ticket\/[^/]+\/assign$/,
    scopes: ['global', 'issue-menu', 'issue-actions']
  },
  {
    pattern: /^\/ticket\/[^/]+\/status$/,
    scopes: ['global', 'issue-menu', 'issue-actions']
  },
  {
    pattern: /^\/ticket\/[^/]+\/priority$/,
    scopes: ['global', 'issue-menu', 'issue-actions']
  },
  {
    pattern: /^\/ticket\/[^/]+\/details$/,
    scopes: ['global', 'issue-menu', 'issue-actions']
  },
  {
    pattern: /^\/ticket\/[^/]+/,
    scopes: ['global', 'issue-menu', 'issue-actions']
  },
  // Create issue flow
  {
    pattern: /^\/new-issue\/edit$/,
    scopes: ['global', 'create-issue', 'field-input']
  },
  {
    pattern: /^\/new-issue\/review$/,
    scopes: ['global', 'create-issue']
  },
  {
    pattern: /^\/new-issue/,
    scopes: ['global', 'create-issue']
  }
]

/**
 * Determines which scopes should be active for a given route.
 */
function getScopesForRoute(pathname: string): HotkeyScope[] {
  for (const { pattern, scopes } of ROUTE_SCOPE_MAP) {
    if (pattern.test(pathname)) {
      return scopes
    }
  }

  // Default to global scope only
  return ['global']
}

/**
 * Automatically manages hotkey scopes based on route navigation.
 *
 * This hook:
 * 1. Monitors route changes
 * 2. Determines which scopes should be active
 * 3. Enables/disables scopes via react-hotkeys-hook context
 *
 * Scopes are additive - a route can have multiple active scopes.
 * For example, `/ticket/ABC-123` activates both 'global' and 'issue-menu'.
 *
 * The 'global' scope is always active and contains hotkeys that work everywhere
 * (like escape for navigation).
 */
export function useScopeManager() {
  const { pathname } = useLocation()
  const { enableScope, disableScope } = useHotkeysContext()

  useEffect(() => {
    // Determine scopes for current route
    const activeScopes = getScopesForRoute(pathname)

    // All possible scopes
    const allScopes: HotkeyScope[] = [
      'global',
      'main-menu',
      'issue-menu',
      'issue-actions',
      'create-issue',
      'field-input'
    ]

    // Enable scopes that should be active
    for (const scope of activeScopes) {
      enableScope(scope)
    }

    // Disable scopes that should not be active
    const inactiveScopes = allScopes.filter(
      (scope) => !activeScopes.includes(scope)
    )
    for (const scope of inactiveScopes) {
      disableScope(scope)
    }

    // Cleanup on unmount or route change
    return () => {
      // Keep global scope active, disable others
      for (const scope of allScopes) {
        if (scope !== 'global') {
          disableScope(scope)
        }
      }
    }
  }, [pathname, enableScope, disableScope])
}
