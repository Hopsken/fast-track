import { CustomBackground } from "@/utils/storage"
import { TinyColor } from "@ctrl/tinycolor"
import $ from "cash-dom"
import screenfull from "screenfull"

// Dark mode CSS
const darkModeStyle = `
html {
  filter: invert(86%) hue-rotate(180deg) brightness(105%) contrast(105%);
  background: white;
}
body {
  background: white;
}
#ak-side-navigation [data-navheader*="true"] span:empty,
.atlaskit-portal [data-placement="bottom-end"] span:empty,
[aria-label*="profile"] span:empty,
[data-testid*="profile"] span:empty,
[data-test-id*="profile"] span:empty,
span[role="img"],
img,
svg,
iframe,
.emoji-common-emoji-sprite,
.css-1kl9gof,
.pdfViewer,
.media-viewer-popup,
.page,
.media-card-inline-player,
#tempo-nav,
.tempo-app-container {
  filter: invert(100%) hue-rotate(180deg) brightness(105%) contrast(105%);
  border-color: transparent;
}
[data-testid="Content"] > div:first-child {
  background: white;
}
[data-testid="media-viewer-image"] {
  filter: inherit;
}
`


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

// Card highlighter function
function highlightCard(card: HTMLElement) {
  if (!card) return
  const grabber = card.querySelector(".ghx-grabber") as HTMLElement
  const backgroundColor = grabber?.style.backgroundColor
  if (!backgroundColor) return
  const color = new TinyColor(backgroundColor)
  card.style.background = color.setAlpha(0.3).toRgbString()
}

// Dark mode functions
let darkModeStyleElement: HTMLStyleElement

function createDarkModeStyleElement(auto: boolean) {
  const element = darkModeStyleElement ?? document.createElement("style")
  
  if (auto) {
    element.textContent = `
    @media (prefers-color-scheme: dark) {
      ${darkModeStyle}
    }`
  } else {
    element.textContent = darkModeStyle
  }
  
  darkModeStyleElement = element
  return element
}

// Standup helper functions
function isInJiraNativeFullScreenMode() {
  return $("#fullscreen-global-style").length > 0
}

async function registerAutoEnterFullScreen() {
  if (!isJiraWebPage(document)) return
  if (!screenfull.isEnabled) return

  let isAutoEnterFullScreen = await persistLayer.autoFullScreen.getValue()

  persistLayer.autoFullScreen.watch((newValue) => {
    isAutoEnterFullScreen = newValue
  })

  const triggerSelectors = [
    'button[data-testid="platform.ui.fullscreen-button.fullscreen-button"]',
    "button.js-compact-toggle"
  ].join(", ")

  $("#jira").on("click", triggerSelectors, () => {
    if (!isAutoEnterFullScreen) return

    if (screenfull.isFullscreen) {
      if (isInJiraNativeFullScreenMode()) {
        screenfull.exit()
      }
    } else {
      if (!isInJiraNativeFullScreenMode()) {
        screenfull.request()
      }
    }
  })
}

let styleElement: HTMLStyleElement

function createStyleElement(innerText: string) {
  const element = styleElement ?? document.createElement("style")
  element.textContent = innerText
  styleElement = element
  return element
}

async function initCSSVariables() {
  const customBackground = await persistLayer.customBackground.getValue()

  if (customBackground) {
    const styleElement = createStyleElement(`
    :root {
      --jira-boost-custom-theme-image: url(${customBackground.url});
      `)
    document.head.appendChild(styleElement)
  }

  const onBackgroundChange = (newValue?: CustomBackground) => {
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

  const unwatch = persistLayer.customBackground.watch(onBackgroundChange)

  return () => {
    styleElement?.remove()
    unwatch()
  }
}

export default defineContentScript({
  matches: ["https://*.atlassian.net/jira*"],

  allFrames: true,

  runAt: "document_idle",

  async main() {
    if (!isJiraWebPage(document)) return

    // Initialize dark mode
    const darkMode = (await persistLayer.darkMode.getValue()) ?? "auto"
    if (darkMode !== "disable") {
      document.head.appendChild(createDarkModeStyleElement(darkMode === "auto"))
    }
    
    persistLayer.darkMode.watch((newValue) => {
      const el = createDarkModeStyleElement(newValue === "auto")
      if (newValue !== "disable") {
        document.head.appendChild(el)
      } else {
        el.remove()
      }
    })

    // Initialize card highlighter
    let isHighlightEnabled = await persistLayer.colorfulCard.getValue()
    
    function updateColors(highlight: boolean) {
      const kanban = getKanbanBoard(document)
      if (!kanban) return
      let grabbers = kanban.querySelectorAll(`[class*="ghx-type-"]`)
      grabbers.forEach((el) => {
        if (!(el instanceof HTMLElement)) return
        if (highlight) highlightCard(el)
        else el.style.background = "unset"
      })
    }

    const jiraApp = getJiraApp(document)
    if (jiraApp) {
      const containerObserver = new MutationObserver(() => {
        updateColors(isHighlightEnabled)
      })
      containerObserver.observe(jiraApp, { childList: true, subtree: true })

      isHighlightEnabled && updateColors(true)

      persistLayer.colorfulCard.watch((newValue) => {
        isHighlightEnabled = !!newValue
        updateColors(isHighlightEnabled)
      })
    }

    // Initialize standup mode
    await registerAutoEnterFullScreen()

    // Initialize page observer for theme
    const pageObserver = new PageObserver()

    pageObserver.register({
      key: "theme",
      when: () => !!getKanbanBoard(document),
      effect: async () => {
        const themeStyleElement = document.createElement("style")
        themeStyleElement.id = "jira-boost-theme"
        themeStyleElement.textContent = backgroundStyle
        document.head.appendChild(themeStyleElement)

        const unsubscribe = await initCSSVariables()

        return () => {
          themeStyleElement.remove()
          unsubscribe()
        }
      }
    })
  }
})
