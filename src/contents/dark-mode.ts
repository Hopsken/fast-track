import darkModeStyle from "data-text:~styles/dark-mode.css"
import type { PlasmoCSConfig } from "plasmo"

import { PersistLayer, StorageKey } from "~storage"
import { isJiraWebPage } from "~utils/is-jira-page"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end"
}

let styleElement: HTMLStyleElement

function createStyleElement(auto: boolean) {
  const element = styleElement ?? document.createElement("style")

  if (auto) {
    element.textContent = `
    @media (prefers-color-scheme: dark) {
      ${darkModeStyle}
    }`
  } else {
    element.textContent = darkModeStyle
  }

  styleElement = element
  return element
}

async function main() {
  if (!isJiraWebPage(document)) return
  const persistLayer = new PersistLayer()
  const darkMode = (await persistLayer.get(StorageKey.DarkMode)) ?? "auto"

  if (darkMode !== "disable") {
    document.head.appendChild(createStyleElement(darkMode === "auto"))
  }

  persistLayer.watch(StorageKey.DarkMode, ({ newValue }) => {
    const el = createStyleElement(newValue === "auto")
    if (newValue !== "disable") {
      document.head.appendChild(el)
    } else {
      el.remove()
    }
  })
}

main()
