import { useEffect, useState } from 'react'

import { browser } from '#imports'

export function useVersion() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    const { version } = browser.runtime.getManifest()
    setVersion(version)
  }, [])

  return version
}
