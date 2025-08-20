import { browser } from '#imports'

export function openOptionsPage() {
  try {
    browser.runtime.openOptionsPage()
  } catch (_) {
    // @ts-expect-error
    // Edge issue. https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9929926/
    const optionsPage = browser.runtime.getManifest().options_page
    const optionsPageUrl = browser.runtime.getURL(optionsPage)
    browser.tabs.create({ url: optionsPageUrl })
  }
}

export function openInNewTab(url: string) {
  browser.tabs.create({ url })
}
