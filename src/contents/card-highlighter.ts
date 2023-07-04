import { TinyColor } from "@ctrl/tinycolor"
import type { PlasmoCSConfig } from "plasmo"

import { PersistLayer, StorageKey } from "~storage"
import { getJiraApp, getKanbanBoard, isJiraWebPage } from "~utils/is-jira-page"

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

async function main() {
  if (!isJiraWebPage(document)) return

  const persistLayer = new PersistLayer()
  let isHighlightEnabled = await persistLayer.get(StorageKey.ColorCard)

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
  if (!jiraApp) return

  const containerObserver = new MutationObserver(() => {
    updateColors(isHighlightEnabled)
  })
  containerObserver.observe(jiraApp, { childList: true, subtree: true })

  isHighlightEnabled && updateColors(true)

  persistLayer.watch(StorageKey.ColorCard, ({ newValue }) => {
    isHighlightEnabled = !!newValue
    updateColors(isHighlightEnabled)
  })
}

main()
