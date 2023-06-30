import type { PlasmoCSConfig } from "plasmo"

import { getKanbanBoard, isJiraWebPage } from "~utils/is-jira-page"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

const backgroundStyle = `
 #jira-frontend {
  background-image: url("https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1280x1920/bdce2ff22d65d9f837c613f63004b1e2/photo-1617049690922-2014b68ee066.jpg") !important;
  background-position: 50% !important;
  background-size: cover !important;
 }

 #ak-jira-navigation header, #ak-side-navigation nav {
  scrollbar-color: initial transparent;
  --ds-surface: transparent;
  --ds-menu-seperator-color: transparent;
  --ds-menu-scroll-indicator-color: transparent;
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

`

async function main() {
  if (!isJiraWebPage(document)) return
  if (!getKanbanBoard(document)) return

  const styleElement = document.createElement("style")
  styleElement.id = "jira-boost-theme"
  styleElement.textContent = backgroundStyle
  document.head.appendChild(styleElement)
}

main()
