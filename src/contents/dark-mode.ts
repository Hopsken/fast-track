import darkModeStyle from "data-text:~styles/dark-mode.css"
import type { PlasmoCSConfig } from "plasmo"
import { StorageKey, PersistLayer } from "~storage"

import { isJiraWebPage } from "~utils/is-jira-page"

// TODO: runs at document start, if domain match, then inject, else delay to document load
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end"
}

let styleElement: HTMLStyleElement

function getDarkModeStyle() {
  if (styleElement) return styleElement
  const newElement = document.createElement("style")
  newElement.textContent = darkModeStyle
  styleElement = newElement
  return newElement
}

async function main() {
  if (!isJiraWebPage(document)) return
  const persistLayer = new PersistLayer()
  const isDarkModeEnabled = await persistLayer.get(StorageKey.DarkMode)

  if (isDarkModeEnabled) {
    document.head.appendChild(getDarkModeStyle())
  }

  persistLayer.watch(StorageKey.DarkMode, ({ newValue }) => {
    const el = getDarkModeStyle()
    if (newValue) {
      document.head.appendChild(el)
    } else {
      el.remove()
    }
  })
}

main()
