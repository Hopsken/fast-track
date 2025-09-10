import $ from 'cash-dom'

import { isJiraWebPage } from './is-jira-page'

type Effect = {
  key: string
  when: (document: Document) => boolean
  effect: () => Promise<() => void> | (() => void)
}

export class PageObserver {
  private currentPath: string = ''
  private registry: Record<string, Effect & { active?: boolean }> = {}
  private cleanup: Record<string, (() => void) | undefined> = {}

  constructor() {
    if (!isJiraWebPage(document)) {
      return
    }

    this.currentPath = location.pathname
    this.initListener()
  }

  private initListener() {
    $('#jira').on('click', () => {
      // wait for history change
      setTimeout(() => {
        const newPath = location.pathname
        if (newPath !== this.currentPath) {
          this.currentPath = newPath
          Promise.resolve().then(() => {
            this.executeEffects()
          })
        }
      }, 300)
    })
  }

  register(effect: Effect) {
    this.registry[effect.key] = effect
    this.executeEffect(effect.key)

    return () => {
      delete this.registry[effect.key]
      this.cleanup[effect.key]?.()
      delete this.cleanup[effect.key]
    }
  }

  private executeEffects() {
    Object.keys(this.registry).forEach((key) => {
      this.executeEffect(key)
    })
  }

  private async executeEffect(effectKey: string) {
    const effect = this.registry[effectKey]
    if (!effect) return

    const active = effect.when(document)
    if (active) {
      // if is active before, skip
      if (effect.active) return active
      try {
        this.cleanup[effect.key] = await effect.effect()
        effect.active = active
      } catch {
        //
      }
    } else {
      this.cleanup[effect.key]?.()
      this.cleanup[effect.key] = undefined
      effect.active = false
    }

    return active
  }
}
