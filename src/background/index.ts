import browser from "webextension-polyfill"

import { openJiraIssue } from "~utils/open-jira-issue"

browser.omnibox.onInputEntered.addListener((text: string) => {
  // Event handler for user entering keyword and pressing space/enter
  openJiraIssue(text)
})
