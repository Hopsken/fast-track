import { MemoryRouter, Route, Routes } from "react-router-dom"

import { PopupHeader } from "./PopupHeader"
import { PopupHomeMenu } from "./PopupHomeMenu"
import { PopupThemePicker } from "./PopupThemePicker"

export function Popup() {
  return (
    <MemoryRouter>
      <div className="container mx-auto w-96 px-4 py-4 font-sans">
        <PopupHeader />

        <div className="divider my-2" />

        <Routes>
          <Route index element={<PopupHomeMenu />} />
          <Route path="/themes" element={<PopupThemePicker />} />
        </Routes>
      </div>
    </MemoryRouter>
  )
}
