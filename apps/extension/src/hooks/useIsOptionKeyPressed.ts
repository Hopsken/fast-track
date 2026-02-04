import { isHotkeyPressed } from 'react-hotkeys-hook'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ModifierKey = 'alt' | 'ctrl' | 'shift' | 'meta'

interface ModifierKeyState {
  pressed: Record<ModifierKey, boolean>
  setPressed: (key: ModifierKey, pressed: boolean) => void
}

const useModifierKeyStore = create<ModifierKeyState>()(
  devtools(
    (set) => ({
      pressed: {
        alt: isHotkeyPressed('alt'),
        ctrl: isHotkeyPressed('ctrl'),
        shift: isHotkeyPressed('shift'),
        meta: isHotkeyPressed('meta')
      },
      setPressed: (key: ModifierKey, pressed: boolean) =>
        set((state) => ({
          pressed: {
            ...state.pressed,
            [key]: pressed
          }
        }))
    }),
    { name: 'modifier-key-store' }
  )
)

// Set up global event listeners once
const updateModifierStates = () => {
  const { setPressed } = useModifierKeyStore.getState()
  const modifiers: ModifierKey[] = ['alt', 'ctrl', 'shift', 'meta']

  modifiers.forEach((modifier) => {
    setPressed(modifier, isHotkeyPressed(modifier))
  })
}

const handleKeyDown = () => {
  updateModifierStates()
}

const handleKeyUp = () => {
  updateModifierStates()
}

// Initialize listeners when module loads
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyDown, { passive: true })
  window.addEventListener('keyup', handleKeyUp, { passive: true })
}

/**
 * Generic hook to check if a specific modifier key is pressed.
 * @param modifier - The modifier key to check ('alt', 'ctrl', 'shift', 'meta')
 */
export function useIsModifierPressed(modifier: ModifierKey) {
  return useModifierKeyStore((state) => state.pressed[modifier])
}

/**
 * Hook to check if the Option/Alt key is currently pressed.
 * @deprecated Use useIsAltPressed() instead
 */
export function useIsOptionKeyPressed() {
  return useModifierKeyStore((state) => state.pressed.alt)
}

/**
 * Hook to check if the Alt/Option key is currently pressed.
 */
export function useIsAltPressed() {
  return useModifierKeyStore((state) => state.pressed.alt)
}

/**
 * Hook to check if the Control key is currently pressed.
 */
export function useIsCtrlPressed() {
  return useModifierKeyStore((state) => state.pressed.ctrl)
}

/**
 * Hook to check if the Shift key is currently pressed.
 */
export function useIsShiftPressed() {
  return useModifierKeyStore((state) => state.pressed.shift)
}

/**
 * Hook to check if the Command (Mac) / Windows key is currently pressed.
 */
export function useIsCommandPressed() {
  return useModifierKeyStore((state) => state.pressed.meta)
}

/**
 * Hook to check if the Meta key (Command on Mac, Windows key on Windows) is currently pressed.
 */
export function useIsMetaPressed() {
  return useModifierKeyStore((state) => state.pressed.meta)
}

export function useIsAnyModifierPressed(modifiers: ModifierKey[]) {
  return useModifierKeyStore((state) =>
    modifiers.some((modifier) => state.pressed[modifier])
  )
}
