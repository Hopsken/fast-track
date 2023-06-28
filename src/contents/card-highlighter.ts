import { TinyColor } from "@ctrl/tinycolor"
import type { PlasmoCSConfig } from "plasmo"

import { getKanbanBoard, isJiraWebPage } from "~utils/is-jira-page"

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


  const jiraApp = document.getElementById("jira-frontend")
  function updateColors() {
    const kanban = getKanbanBoard(document)
    if (!kanban) return
    let grabbers = kanban.querySelectorAll(`[class*="ghx-type-"]`)
    grabbers.forEach((el) => {
      highlightCard(el as HTMLElement)
    })
  }

  const containerObserver = new MutationObserver(() => updateColors())
  containerObserver.observe(jiraApp, { childList: true, subtree: true })
  updateColors()
}

main()
