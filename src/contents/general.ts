import type { PlasmoCSConfig } from "plasmo"

import type { StorageWatchCallback } from "@plasmohq/storage"

import { StorageKey, persistLayer } from "~storage"
import { getKanbanBoard, isJiraWebPage } from "~utils/is-jira-page"
import { PageObserver } from "~utils/page-observer"

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

  if (customBackground) {
    const styleElement = createStyleElement(`
    :root {
      --jira-boost-custom-theme-image: url(${customBackground.url});
      `)
    document.head.appendChild(styleElement)
  }

  const onBackgroundChange: StorageWatchCallback = async ({ newValue }) => {
    if (newValue) {
      createStyleElement(`
      :root {
        --jira-boost-custom-theme-image: url(${newValue.url});
      }`)
      document.head.appendChild(styleElement)
    } else {
      styleElement?.remove()
    }
  }

  persistLayer.watch(StorageKey.CustomBackground, onBackgroundChange)

  return () => {
    styleElement?.remove()
    persistLayer.unwatch(StorageKey.CustomBackground, onBackgroundChange)
  }
}

async function main() {
  if (!isJiraWebPage(document)) return

  const pageObserver = new PageObserver()

  pageObserver.register({
    key: "theme",
    when: () => !!getKanbanBoard(document),
    effect: async () => {
      console.info("injecting")
      const themeStyleElement = document.createElement("style")
      themeStyleElement.id = "jira-boost-theme"
      themeStyleElement.textContent = backgroundStyle
      document.head.appendChild(themeStyleElement)

      const unsubscribe = await initCSSVariables()

      return () => {
        console.info("cleanning up")
        themeStyleElement.remove()
        unsubscribe()
      }
    }
  })
}

main()
