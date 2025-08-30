import { nanoid } from 'nanoid'
import { useCallback } from 'react'

import {
  activateLicense,
  deactivateLicense,
  validateLicense
} from '~/lib/lemonsqueezy'
import { useStorage, StorageKey } from '~/storage'

export function useLicense() {
  const [license, setLicense] = useStorage(StorageKey.License)

  const revalidate = useCallback(async () => {
    if (!license) return { valid: false, error: 'No license' }
    const { valid, error, ...info } = await validateLicense(
      license.license_key.key,
      license.instance.id
    )
    setLicense({
      valid,
      lastChecked: new Date().toISOString(),
      ...info
    })
    return { valid, error }
  }, [license])

  const activate = useCallback(async (key: string) => {
    const { activated, error, ...info } = await activateLicense(key, nanoid())
    if (activated) {
      setLicense({
        valid: true,
        lastChecked: new Date().toISOString(),
        ...info
      })
    }
    return { activated, error }
  }, [])

  const deactivate = useCallback(async () => {
    if (!license) return false
    const { deactivated } = await deactivateLicense(
      license.license_key.key,
      license.instance.id
    )
    if (deactivated) {
      setLicense(null)
    }
    return true
  }, [license])

  return {
    license,
    valid: license?.valid ?? false,
    activate,
    revalidate,
    deactivate
  }
}
