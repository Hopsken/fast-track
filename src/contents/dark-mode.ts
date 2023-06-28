import darkModeStyle from "data-text:~styles/dark-mode.css"
import type { PlasmoCSConfig } from "plasmo"

import { isJiraWebPage } from "~utils/is-jira-page"

// TODO: runs at document start, if domain match, then inject, else delay to document load
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end"
}

function injectDarkModeCSS() {
  const styleElement = document.createElement("style")
  styleElement.textContent = darkModeStyle
  document.head.appendChild(styleElement)
}

function main() {
  if (!isJiraWebPage(document)) return
  injectDarkModeCSS()
}

main()
