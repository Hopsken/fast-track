import { TinyColor } from "@ctrl/tinycolor"

function highlightCard(card: HTMLElement) {
  if (!card) return
  const grabber = card.querySelector(".ghx-grabber") as HTMLElement
  const backgroundColor = grabber?.style.backgroundColor
  if (!backgroundColor) return
  const color = new TinyColor(backgroundColor)
  card.style.background = color.setAlpha(0.3).toRgbString()
}

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,

  async main() {
    if (!isJiraWebPage(document)) return

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
    if (!jiraApp) return

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
})
