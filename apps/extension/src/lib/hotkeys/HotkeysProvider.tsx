import { ReactNode } from 'react'
import { HotkeysProvider as ReactHotkeysProvider } from 'react-hotkeys-hook'

interface HotkeysProviderProps {
  children: ReactNode
}

/**
 * Wraps the application with react-hotkeys-hook provider.
 * Initializes with 'global' scope always active.
 *
 * Additional scopes are activated/deactivated automatically
 * by useScopeManager based on route navigation.
 */
export function HotkeysProvider({ children }: HotkeysProviderProps) {
  return (
    <ReactHotkeysProvider initiallyActiveScopes={['global']}>
      {children}
    </ReactHotkeysProvider>
  )
}
