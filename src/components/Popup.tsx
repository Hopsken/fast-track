import { useMount } from "ahooks"
import { addDays, isAfter } from "date-fns"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { useLicense } from "~/hooks/useLicense"

import { ManageLicense } from "./ManageLicense"
import { PopupHeader } from "./PopupHeader"
import { PopupHomeMenu } from "./PopupHomeMenu"
import { PopupThemePicker } from "./PopupThemePicker"
import { UpgradePro } from "./Upgrade"

export function Popup() {
  const { license, revalidate } = useLicense()

  useMount(() => {
    setTimeout(() => {
      if (!license) return
      const now = new Date()
      if (isAfter(now, addDays(new Date(license.lastChecked), 1))) {
        revalidate()
      }
    }, 200)
  })

  return (
    <MemoryRouter>
      <div className="container mx-auto w-96 px-4 py-4 font-sans">
        <PopupHeader />

        <div className="divider my-2" />

        <Routes>
          <Route index element={<PopupHomeMenu />} />
          <Route path="/themes" element={<PopupThemePicker />} />
          <Route path="/upgrade" element={<UpgradePro />} />
          <Route path="/manage-license" element={<ManageLicense />} />
        </Routes>
      </div>
    </MemoryRouter>
  )
}
