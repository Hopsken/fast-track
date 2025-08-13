import darkModeStyle from "data-text:~styles/dark-mode.css"

let styleElement: HTMLStyleElement

function createStyleElement(auto: boolean) {
  const element = styleElement ?? document.createElement("style")

  if (auto) {
    element.textContent = `
    @media (prefers-color-scheme: dark) {
      ${darkModeStyle}
    }`
  } else {
    element.textContent = darkModeStyle
  }

  styleElement = element
  return element
}

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  runAt: "document_end",

  async main() {
    if (!isJiraWebPage(document)) return
    const darkMode = (await persistLayer.darkMode.getValue()) ?? "auto"

    if (darkMode !== "disable") {
      document.head.appendChild(createStyleElement(darkMode === "auto"))
    }

    persistLayer.darkMode.watch((newValue) => {
      const el = createStyleElement(newValue === "auto")
      if (newValue !== "disable") {
        document.head.appendChild(el)
      } else {
        el.remove()
      }
    })
  }
})
