import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useLicense } from "~/hooks/useLicense"

import { ProBadge } from "./ProBadge"

export function ManageLicense() {
  const { deactivate, valid, license } = useLicense()
  const navigate = useNavigate()

  if (!license) {
    return <Link to="/upgrade">Upgrade</Link>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ProBadge isPro={valid} />
      </div>
      <ul className="font-medium list-none">
        <li>Device ID: {license.instance.name}</li>
        <li>License Email: {license.meta.customer_email}</li>
      </ul>

      <DeactivateLicense
        onDeactivate={async () => {
          await deactivate()
          navigate("/upgrade", { replace: true })
        }}
      />
    </div>
  )
}

function DeactivateLicense(props: { onDeactivate: () => void }) {
  const [isActive, setActive] = useState(false)
  if (isActive)
    return (
      <div className="flex gap-2">
        <button
          className="btn btn-outline btn-error btn-xs"
          onClick={() => props.onDeactivate()}>
          Deactivate
        </button>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setActive(false)}>
          Cancel
        </button>
      </div>
    )

  return (
    <button
      className="btn btn-error btn-outline btn-xs"
      onClick={() => setActive(true)}>
      Deactivate current device
    </button>
  )
}
