import { browser } from 'wxt/browser'

/**
 * Firefox built-in data collection consent (Firefox 140+).
 *
 * Analytics is declared as optional `technicalAndInteraction` data in
 * `browser_specific_settings.gecko.data_collection_permissions`, so on
 * Firefox it may only be sent while that permission is granted. Other
 * browsers have no such permission and rely on the in-app setting alone.
 *
 * @see https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
 */

const ANALYTICS_PERMISSION = { data_collection: ['technicalAndInteraction'] }

// `data_collection` is Firefox-only and missing from the Chrome-derived types.
interface DataCollectionPermissionsApi {
  contains(permissions: typeof ANALYTICS_PERMISSION): Promise<boolean>
  request(permissions: typeof ANALYTICS_PERMISSION): Promise<boolean>
  remove(permissions: typeof ANALYTICS_PERMISSION): Promise<boolean>
}

const permissions = () =>
  browser.permissions as unknown as DataCollectionPermissionsApi

export function hasAnalyticsConsent(
  isFirefox = import.meta.env.FIREFOX
): Promise<boolean> {
  if (!isFirefox) return Promise.resolve(true)
  return permissions().contains(ANALYTICS_PERMISSION)
}

/**
 * Must be called directly from a user input handler: Firefox rejects
 * `permissions.request()` once the handler has awaited anything.
 */
export function requestAnalyticsConsent(
  isFirefox = import.meta.env.FIREFOX
): Promise<boolean> {
  if (!isFirefox) return Promise.resolve(true)
  return permissions().request(ANALYTICS_PERMISSION)
}

export async function revokeAnalyticsConsent(
  isFirefox = import.meta.env.FIREFOX
): Promise<void> {
  if (!isFirefox) return
  await permissions().remove(ANALYTICS_PERMISSION)
}

interface BooleanItem {
  getValue(): Promise<boolean>
  setValue(value: boolean): Promise<void>
}

/** Gates an analytics `enabled` setting on the browser's consent. */
export function withAnalyticsConsent(
  item: BooleanItem,
  isFirefox = import.meta.env.FIREFOX
): BooleanItem {
  return {
    getValue: async () =>
      (await item.getValue()) && (await hasAnalyticsConsent(isFirefox)),
    setValue: (value) => item.setValue(value)
  }
}
