import $ from "cash-dom"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { useCallback, useState } from "react"
import { createRoot } from "react-dom/client"
import { FaChild, FaCompressAlt } from "react-icons/fa"
import screenfull from "screenfull"

import { PersistLayer, StorageKey } from "~storage"
import { isJiraWebPage } from "~utils/is-jira-page"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export const getRootContainer = () =>
  new Promise((resolve, reject) => {
    if (!isJiraWebPage(document)) return reject("")
    if (!screenfull.isEnabled) return reject("unsupported browser")

    const checkInterval = setInterval(() => {
      const rootContainerParent = document.querySelector(`#ghx-modes-tools`)
      if (rootContainerParent) {
        clearInterval(checkInterval)
        const rootContainer = document.createElement("div")
        rootContainerParent.insertBefore(
          rootContainer,
          rootContainerParent.firstChild
        )
        resolve(rootContainer)
      }
    }, 137)
  })

const FullScreenStyle = `
#ak-jira-navigation, #ak-side-navigation, #right-sidebar-panel-wrapper, [data-skip-link-wrapper='true'] {
  display: none
}
`

function StandupBtn() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const onClick = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  return (
    <div>
      {isFullscreen && <style>{FullScreenStyle}</style>}
      <button
        className="aui-button aui-mr1"
        data-testid="jira-boost.fullscreen-button"
        onClick={onClick}
        style={{
          marginRight: "5px",
          display: "inline-flex",
          alignItems: "center"
        }}>
        {isFullscreen ? <FaCompressAlt /> : <FaChild />}
        <span style={{ marginLeft: "5px" }}>
          {isFullscreen ? "Exit" : "Stand Up"}
        </span>
      </button>
    </div>
  )
}

async function registerAutoEnterFullScreen() {
  if (!isJiraWebPage(document)) return
  if (!screenfull.isEnabled) return

  const persistLayer = new PersistLayer()
  let isAutoEnterFullScreen = await persistLayer.get(StorageKey.AutoFullScreen)

  persistLayer.watch(StorageKey.AutoFullScreen, ({ newValue }) => {
    isAutoEnterFullScreen = newValue
  })

  const triggerSelectors = [
    'button[data-testid="platform.ui.fullscreen-button.fullscreen-button"]',
    'button[data-testid="jira-boost.fullscreen-button"]',
    "button.js-compact-toggle"
  ].join(", ")

  $("#jira").on("click", triggerSelectors, () => {
    if (!isAutoEnterFullScreen) return
    if (screenfull.isFullscreen) {
      screenfull.exit()
    } else {
      screenfull.request()
    }
  })
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  createRootContainer
}) => {
  registerAutoEnterFullScreen()

  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<StandupBtn />)
}

export default StandupBtn
