import { useMemoizedFn } from 'ahooks'
import { nanoid } from 'nanoid'

import {
  activateLicense,
  deactivateLicense,
  validateLicense
} from '~/lib/lemonsqueezy'
import { useStorage, StorageKey } from '~/storage'

export function useLicense() {
  const [license, setLicense] = useStorage(StorageKey.License)

  const revalidate = useMemoizedFn(async () => {
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
  })

  const activate = useMemoizedFn(async (key: string) => {
    const { activated, error, ...info } = await activateLicense(key, nanoid())
    if (activated) {
      setLicense({
        valid: true,
        lastChecked: new Date().toISOString(),
        ...info
      })
    }
    return { activated, error }
  })

  const deactivate = useMemoizedFn(async () => {
    if (!license) return false
    const { deactivated } = await deactivateLicense(
      license.license_key.key,
      license.instance.id
    )
    if (deactivated) {
      setLicense(null)
    }
    return true
  })

  return {
    license,
    valid: license?.valid ?? false,
    activate,
    revalidate,
    deactivate
  }
}
