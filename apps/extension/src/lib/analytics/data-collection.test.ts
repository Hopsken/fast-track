import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  hasAnalyticsConsent,
  requestAnalyticsConsent,
  revokeAnalyticsConsent,
  withAnalyticsConsent
} from './data-collection'

const permissions = vi.hoisted(() => ({
  contains: vi.fn(),
  request: vi.fn(),
  remove: vi.fn()
}))

vi.mock('wxt/browser', () => ({ browser: { permissions } }))

const ANALYTICS = { data_collection: ['technicalAndInteraction'] }

describe('data collection consent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('outside Firefox', () => {
    it('treats analytics as consented without asking the browser', async () => {
      await expect(hasAnalyticsConsent(false)).resolves.toBe(true)
      await expect(requestAnalyticsConsent(false)).resolves.toBe(true)
      await revokeAnalyticsConsent(false)

      expect(permissions.contains).not.toHaveBeenCalled()
      expect(permissions.request).not.toHaveBeenCalled()
      expect(permissions.remove).not.toHaveBeenCalled()
    })
  })

  describe('on Firefox', () => {
    it('reads the technicalAndInteraction permission', async () => {
      permissions.contains.mockResolvedValue(false)

      await expect(hasAnalyticsConsent(true)).resolves.toBe(false)
      expect(permissions.contains).toHaveBeenCalledWith(ANALYTICS)
    })

    it('requests the permission synchronously to keep the user gesture', () => {
      permissions.request.mockResolvedValue(true)

      const result = requestAnalyticsConsent(true)

      expect(permissions.request).toHaveBeenCalledWith(ANALYTICS)
      return expect(result).resolves.toBe(true)
    })

    it('removes the permission', async () => {
      permissions.remove.mockResolvedValue(true)

      await revokeAnalyticsConsent(true)
      expect(permissions.remove).toHaveBeenCalledWith(ANALYTICS)
    })
  })

  describe('withAnalyticsConsent', () => {
    const createItem = (value: boolean) => ({
      getValue: vi.fn().mockResolvedValue(value),
      setValue: vi.fn().mockResolvedValue(undefined)
    })

    it('is enabled only when the setting is on and consent is granted', async () => {
      permissions.contains.mockResolvedValue(true)
      await expect(
        withAnalyticsConsent(createItem(true), true).getValue()
      ).resolves.toBe(true)

      permissions.contains.mockResolvedValue(false)
      await expect(
        withAnalyticsConsent(createItem(true), true).getValue()
      ).resolves.toBe(false)
    })

    it('skips the consent check when the setting is off', async () => {
      await expect(
        withAnalyticsConsent(createItem(false), true).getValue()
      ).resolves.toBe(false)
      expect(permissions.contains).not.toHaveBeenCalled()
    })

    it('writes through to the setting', async () => {
      const item = createItem(true)

      await withAnalyticsConsent(item, true).setValue(false)
      expect(item.setValue).toHaveBeenCalledWith(false)
    })
  })
})
