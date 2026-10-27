/**
 * Runtime half of the Jira E2E mock switch: `__JIRA_BOOST_E2E__` (set by the
 * Playwright fixture or the verify skill) or `navigator.webdriver`.
 *
 * Callers must also check `import.meta.env.VITE_E2E_MOCKS === '1'` inline,
 * before calling this. The inline check is replaced at build time, so normal
 * builds drop the mock imports. Moving it into this function would ship the
 * mocks in production bundles.
 */
export function isJiraE2ERuntimeEnabled(): boolean {
  const runtimeFlagEnabled =
    (globalThis as unknown as { __JIRA_BOOST_E2E__?: boolean })
      .__JIRA_BOOST_E2E__ === true

  const webdriverEnabled =
    typeof navigator !== 'undefined' && navigator.webdriver === true

  return runtimeFlagEnabled || webdriverEnabled
}
