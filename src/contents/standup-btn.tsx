import $ from "cash-dom"
import { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { FaChild, FaCompressAlt } from "react-icons/fa"
import screenfull from "screenfull"

const FullScreenStyle = `
#ak-jira-navigation, #ak-side-navigation, #right-sidebar-panel-wrapper, [data-skip-link-wrapper='true'] {
  display: none
}
`

function StandupBtn() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoEnterFullScreen] = useStorage(persistLayer.autoFullScreen, false)

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen)
    }
    screenfull.on("change", onFullScreenChange)
    return () => {
      screenfull.off("change", onFullScreenChange)
    }
  }, [])

  const onClick = useCallback(() => {
    setIsFullscreen((prev) => {
      const nextVal = !prev
      if (!isAutoEnterFullScreen) return nextVal
      if (nextVal) screenfull.request()
      else screenfull.exit()
      return nextVal
    })
  }, [isAutoEnterFullScreen])

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

export default defineContentScript({
  async main(ctx) {
    registerAutoEnterFullScreen()

    const ui = await createShadowRootUi(ctx, {
      name: "jboost-standup-btn",
      position: "inline",
      onMount(uiContainer, shadow, shadowHost) {
        const root = createRoot(uiContainer)
        root.render(<StandupBtn />)
        return root
      },
      onRemove(mounted) {
        mounted?.unmount()
      }
    })

    ui.mount()
  }
})
