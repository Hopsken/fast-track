import { useEffect, useState } from "react"
import Browser from "webextension-polyfill"

export function useVersion() {
  const [version, setVersion] = useState("")

  useEffect(() => {
    const version = Browser.runtime.getManifest().version
    setVersion(version)
  }, [])

  return version
}
