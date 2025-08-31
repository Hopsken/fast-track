/**
 * Utilities for DOM mutation observation
 */

export interface ObserverConfig {
  childList?: boolean
  subtree?: boolean
  attributes?: boolean
  attributeOldValue?: boolean
  characterData?: boolean
  characterDataOldValue?: boolean
}

export class MutationObserverManager {
  private observers = new Map<string, MutationObserver>()

  /**
   * Creates and starts a mutation observer
   */
  observe(
    id: string,
    target: Element,
    callback: MutationCallback,
    config: ObserverConfig = { childList: true, subtree: true }
  ): MutationObserver {
    // Disconnect existing observer with same id
    this.disconnect(id)

    const observer = new MutationObserver(callback)
    observer.observe(target, config)

    this.observers.set(id, observer)
    return observer
  }

  /**
   * Disconnects an observer by id
   */
  disconnect(id: string): void {
    const observer = this.observers.get(id)
    if (observer) {
      observer.disconnect()
      this.observers.delete(id)
    }
  }

  /**
   * Disconnects all managed observers
   */
  disconnectAll(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }

  /**
   * Gets an observer by id
   */
  getObserver(id: string): MutationObserver | undefined {
    return this.observers.get(id)
  }

  /**
   * Checks if an observer exists
   */
  hasObserver(id: string): boolean {
    return this.observers.has(id)
  }
}

// Global instance for content scripts
export const globalObserverManager = new MutationObserverManager()

/**
 * Creates a debounced mutation observer callback
 */
export function createDebouncedCallback(
  callback: () => void,
  delay: number = 300
): MutationCallback {
  let timeoutId: number

  return () => {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(callback, delay)
  }
}
