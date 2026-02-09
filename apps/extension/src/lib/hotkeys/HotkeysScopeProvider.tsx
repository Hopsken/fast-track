import { PropsWithChildren, useEffect } from 'react'
import { useHotkeysContext } from 'react-hotkeys-hook'

import type { HotkeyScope } from './types'

export function HotkeysScope({
  scope,
  children
}: PropsWithChildren<{
  scope: HotkeyScope
}>) {
  const { enableScope, disableScope } = useHotkeysContext()

  useEffect(() => {
    enableScope(scope)
    return () => {
      disableScope(scope)
    }
  }, [scope, enableScope, disableScope])

  return children
}
