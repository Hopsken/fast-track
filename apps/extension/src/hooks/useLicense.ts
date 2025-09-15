import { useMemoizedFn } from 'ahooks'
import { nanoid } from 'nanoid'

import {
  activateLicense,
  deactivateLicense,
  validateLicense
} from '~/lib/lemonsqueezy'

import { useStorage } from './useStorage'

export function useLicense() {
  const [license, setLicense] = useStorage('License')

  const revalidate = useMemoizedFn(async () => {
    if (!license) return { valid: false, error: 'No license' }
    const { valid, error, ...info } = await validateLicense(
      license.license_key.key,
      license.instance.id
    )
    setLicense({
      ...info,
      valid,
      lastChecked: new Date().toISOString()
    })
    return { valid, error }
  })

  const activate = useMemoizedFn(async (key: string) => {
    const { activated, error, ...info } = await activateLicense(key, nanoid())
    if (activated) {
      setLicense({
        ...info,
        valid: true,
        lastChecked: new Date().toISOString()
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
