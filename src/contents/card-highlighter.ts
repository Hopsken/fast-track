import { TinyColor } from "@ctrl/tinycolor"
import type { PlasmoCSConfig } from "plasmo"

import { isJiraWebPage } from "~utils/is-jira-page"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

function highlightCard(card: HTMLElement) {
  if (!card) return
  const grabber = card.querySelector(".ghx-grabber") as HTMLElement
  const backgroundColor = grabber?.style.backgroundColor
  if (!backgroundColor) return
  const color = new TinyColor(backgroundColor)
  card.style.background = color.setAlpha(0.3).toRgbString()
}

function main() {
  if (!isJiraWebPage(document)) return

  const poolContainer = document.getElementById("ghx-pool-column")
  if (!poolContainer) return

  function updateColors() {
    let grabbers = poolContainer.querySelectorAll(`[class*="ghx-type-"]`)
    grabbers.forEach((el) => {
      highlightCard(el as HTMLElement)
    })
  }

  const containerObserver = new MutationObserver(() => updateColors())
  containerObserver.observe(poolContainer, { childList: true, subtree: true })
  updateColors()
}

main()
