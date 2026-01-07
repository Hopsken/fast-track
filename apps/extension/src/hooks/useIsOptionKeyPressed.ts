import { useState } from 'react'
import { useEventListener } from 'ahooks'
import { isHotkeyPressed } from 'react-hotkeys-hook'

export function useIsOptionKeyPressed() {
  const [pressed, setPressed] = useState(isHotkeyPressed('alt'))

  useEventListener(
    'keydown',
    () => {
      setPressed(isHotkeyPressed('alt'))
    },
    { passive: true }
  )

  useEventListener(
    'keyup',
    () => {
      setPressed(isHotkeyPressed('alt'))
    },
    { passive: true }
  )

  return pressed
}
