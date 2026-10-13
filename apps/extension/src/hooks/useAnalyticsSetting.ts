import { useCallback, useEffect, useState } from 'react'

import {
  hasAnalyticsConsent,
  requestAnalyticsConsent,
  revokeAnalyticsConsent
} from '@/lib/analytics/data-collection'

import { useStorage } from './useStorage'

/**
 * The analytics setting as the user sees it: the stored preference combined
 * with the browser's data collection consent (Firefox only).
 */
export function useAnalyticsSetting(): [boolean, (enabled: boolean) => void] {
  const [stored, setStored] = useStorage('analytics-enabled')
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    void hasAnalyticsConsent().then(setConsented)
  }, [])

  const setEnabled = useCallback(
    (enabled: boolean) => {
      if (!enabled) {
        setStored(false)
        void revokeAnalyticsConsent()
        return
      }
      // Request first, without awaiting anything, to keep the user gesture.
      void requestAnalyticsConsent().then((granted) => {
        setConsented(granted)
        if (granted) setStored(true)
      })
    },
    [setStored]
  )

  return [stored && consented, setEnabled]
}
