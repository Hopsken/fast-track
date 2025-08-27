import { browser } from '#imports'
import { openJiraIssue } from '~/utils/open-jira-issue'
import { openOptionsPage } from '~/utils/broswer'

export default defineBackground(() => {
  browser.omnibox.onInputEntered.addListener((text: string) => {
    // Event handler for user entering keyword and pressing space/enter
    openJiraIssue(text)
  })

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      openOptionsPage()
    }
  })
})
