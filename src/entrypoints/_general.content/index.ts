import { CustomBackground } from "@/utils/storage"

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
  matches: ["<all_urls>"],

  allFrames: true,

  runAt: "document_idle",

  async main() {
    if (!isJiraWebPage(document)) return

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
