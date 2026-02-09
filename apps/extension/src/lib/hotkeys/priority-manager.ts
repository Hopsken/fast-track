import type { RegisterHotkeyOptions } from './types'

export type { RegisterHotkeyOptions } from './types'

interface RegisteredHotkey extends RegisterHotkeyOptions {
  instanceId: string
}

let nextId = 0

/**
 * Module-level singleton that tracks all mounted useHotkey instances.
 * At invocation time, determines whether a given instance has the highest
 * priority among all active instances sharing the same key combo.
 */
class HotkeyPriorityManager {
  private instances = new Map<string, RegisteredHotkey>()

  register(options: RegisterHotkeyOptions): string {
    const instanceId = `hotkey-${nextId++}`
    this.instances.set(instanceId, { instanceId, ...options })
    return instanceId
  }

  unregister(instanceId: string): void {
    this.instances.delete(instanceId)
  }

  updateEnabled(instanceId: string, enabled: boolean): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.enabled = enabled
    }
  }

  /**
   * Returns true if this instance should execute its callback.
   * Checks all other enabled registered instances with the same normalizedKeys.
   * If any has strictly higher priority, returns false.
   * Equal priority → both execute (preserves current behavior).
   *
   * Scope filtering is handled by react-hotkeys-hook — it only invokes
   * callbacks whose scopes are active, so the priority manager doesn't
   * need to duplicate that check.
   */
  shouldExecute(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    for (const other of this.instances.values()) {
      if (other.instanceId === instanceId) continue
      if (other.normalizedKeys !== instance.normalizedKeys) continue
      if (!other.enabled) continue

      if (other.priority > instance.priority) {
        return false
      }
    }

    return true
  }
}

export const hotkeyPriorityManager = new HotkeyPriorityManager()
