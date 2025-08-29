import customThemeCSS from '~/assets/styles/custom-theme.css?inline'
import { StyleInjector } from '~/utils/dom/style-injection'
import { isJiraWebPage, getKanbanBoard } from '~/utils/jira/page-detection'
import { CustomBackground } from "@/utils/storage"

export default defineContentScript({
  matches: ["https://*.atlassian.net/jira*"],
  allFrames: true,
  runAt: "document_idle",

  async main() {
    if (!isJiraWebPage(document)) return

    const pageObserver = new PageObserver()

    pageObserver.register({
      key: "theme",
      when: () => !!getKanbanBoard(document),
      effect: async () => {
        // Inject the base theme styles
        StyleInjector.injectStyle('custom-theme', customThemeCSS)

        // Initialize CSS variables for background
        const unsubscribe = await initCustomBackground()

        return () => {
          StyleInjector.removeStyle('custom-theme')
          StyleInjector.removeStyle('theme-variables')
          unsubscribe()
        }
      }
    })
  }
})

/**
 * Initializes custom background CSS variables
 */
async function initCustomBackground(): Promise<() => void> {
  const customBackground = await persistLayer.customBackground.getValue()

  if (customBackground) {
    applyCustomBackground(customBackground)
  }

  // Watch for background changes
  const unwatch = persistLayer.customBackground.watch((newValue) => {
    if (newValue) {
      applyCustomBackground(newValue)
    } else {
      removeCustomBackground()
    }
  })

  return unwatch
}

/**
 * Applies a custom background by setting CSS variables
 */
function applyCustomBackground(background: CustomBackground): void {
  const cssVariables = `
    :root {
      --jira-boost-custom-theme-image: url(${background.url});
    }
  `
  
  StyleInjector.injectStyle('theme-variables', cssVariables)
}

/**
 * Removes custom background styles
 */
function removeCustomBackground(): void {
  StyleInjector.removeStyle('theme-variables')
}