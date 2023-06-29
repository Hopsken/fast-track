import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { FaChild, FaCompressAlt, FaExpandArrowsAlt } from "react-icons/fa"
import screenfull from "screenfull"

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

function StandupBtn() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const listener = () => {
      setIsFullscreen(screenfull.isFullscreen)
    }
    screenfull.on("change", listener)
    return () => {
      screenfull.off("change", listener)
    }
  }, [])

  const onClick = useCallback(() => {
    if (screenfull.isFullscreen) {
      screenfull.exit()
      return
    }

    const mainEl = document.querySelector("#gh")
    if (!mainEl) return
    screenfull.request(mainEl)
  }, [])

  return (
    <div className="">
      <style>
        {`@media all and (display-mode: fullscreen) {
          #gh {
            padding: 24px 40px !important;
          }
        }`}
      </style>
      <button
        className="aui-button aui-mr1"
        style={{
          marginRight: "5px",
          display: "inline-flex",
          alignItems: "center"
        }}
        onClick={onClick}>
        {isFullscreen ? <FaCompressAlt /> : <FaChild />}
        <span style={{ marginLeft: "5px" }}>
          {isFullscreen ? "Exit" : "Stand Up"}
        </span>
      </button>
    </div>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  createRootContainer
}) => {
  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<StandupBtn />)
}

export default StandupBtn
