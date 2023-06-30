import type { PlasmoCSConfig } from "plasmo"

import { StorageKey, persistLayer } from "~storage"
import { getKanbanBoard, isJiraWebPage } from "~utils/is-jira-page"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

const backgroundStyle = `
  #jira-frontend {
    background-image: var(--jira-boost-custom-theme-image) !important;
    background-position: 50% !important;
    background-size: cover !important;
  }

  #ak-jira-navigation header, #ak-side-navigation nav {
    --ds-surface: transparent;
    --ds-menu-seperator-color: transparent;
    --ds-menu-scroll-indicator-color: transparent;
    scrollbar-color: initial transparent;
    background: transparent !important;
    backdrop-filter: blur(50px) !important;
  }

  #ak-main-content::before {
    position: absolute;
    inset: 0;
    content: "";
    background: #ffffff3d;
    backdrop-filter: blur(4px);
  }

  #gh, #ghx-pool, #ghx-column-header-group {
    background: none !important;
  }

  #ghx-pool .ghx-swimlane-header {
    background: #ffffff3d !important;
    backdrop-filter: blur(12px) !important;
  }

`

let styleElement: HTMLStyleElement

function createStyleElement(innerText: string) {
  const element = styleElement ?? document.createElement("style")
  element.textContent = innerText
  styleElement = element
  return element
}

async function initCSSVariables() {
  const customBackground = await persistLayer.get(StorageKey.CustomBackground)
  if (!customBackground) return

  const styleElement = createStyleElement(`
  :root {
    --jira-boost-custom-theme-image: url(${customBackground.url});
  `)
  document.head.appendChild(styleElement)

  persistLayer.watch(StorageKey.CustomBackground, async ({ newValue }) => {
    if (newValue) {
      createStyleElement(`
      :root {
        --jira-boost-custom-theme-image: url(${newValue.url});
      }`)
      document.head.appendChild(styleElement)
    } else {
      styleElement?.remove()
    }
  })
}

async function main() {
  if (!isJiraWebPage(document)) return
  if (!getKanbanBoard(document)) return

  const styleElement = document.createElement("style")
  styleElement.id = "jira-boost-theme"
  styleElement.textContent = backgroundStyle
  document.head.appendChild(styleElement)

  initCSSVariables()
}

main()
