import darkModeCSS from '~/assets/styles/dark-mode.css?inline'
import { StyleInjector } from '~/utils/dom/style-injection'
import { isJiraWebPage } from '~/utils/jira/page-detection'

export default defineContentScript({
  matches: ["https://*.atlassian.net/jira*"],
  allFrames: true,
  runAt: "document_end",

  async main() {
    if (!isJiraWebPage(document)) return

    // Initialize dark mode based on current settings
    const darkMode = (await persistLayer.darkMode.getValue()) ?? "auto"
    
    if (darkMode !== "disable") {
      applyDarkMode(darkMode === "auto")
    }

    // Watch for dark mode setting changes
    persistLayer.darkMode.watch((newValue) => {
      if (newValue !== "disable") {
        applyDarkMode(newValue === "auto")
      } else {
        removeDarkMode()
      }
    })
  }
})

/**
 * Applies dark mode styles with optional auto-detection
 */
function applyDarkMode(auto: boolean): void {
  if (auto) {
    // Wrap in media query for auto mode
    const autoCSS = `@media (prefers-color-scheme: dark) {\n${darkModeCSS}\n}`
    StyleInjector.injectStyle('dark-mode', autoCSS)
  } else {
    // Always apply dark mode
    StyleInjector.injectStyle('dark-mode', darkModeCSS)
  }
}

/**
 * Removes dark mode styles
 */
function removeDarkMode(): void {
  StyleInjector.removeStyle('dark-mode')
}