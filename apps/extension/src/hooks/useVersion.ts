import { browser } from '#imports'
import { useEffect, useState } from 'react'

export function useVersion() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    const { version } = browser.runtime.getManifest()
    setVersion(version)
  }, [])

  return version
}
