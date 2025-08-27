import { LicenseState } from "@/utils/storage"
import iconPNG from "~/assets/logo.png"
import { HiChevronLeft } from "react-icons/hi2"
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

import { ProBadge } from "./ProBadge"

export function PopupHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [license] = useStorage(persistLayer.license, undefined)

  if (pathname === "/") {
    return (
      <header className="flex items-center space-x-2">
        <img src={iconPNG} className="w-6 h-6" alt="Jira Boost" />
        <h1 className="text-lg font-medium text-slate-900">Jira Boost</h1>
        <ProBadge isPro={license?.valid || false} />
      </header>
    )
  }

  return (
    <header className="flex items-center space-x-2">
      <button className="btn btn-sm btn-square" onClick={() => navigate(-1)}>
        <HiChevronLeft />
      </button>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route
            path="themes"
            element={
              <h1 className="text-lg font-medium text-slate-900">Themes</h1>
            }
          />
          <Route
            path="upgrade"
            element={
              <h1 className="text-lg font-medium text-slate-900">
                Upgrade Pro
              </h1>
            }
          />
          <Route
            path="manage-license"
            element={
              <h1 className="text-lg font-medium text-slate-900">License</h1>
            }
          />
        </Route>
      </Routes>
    </header>
  )
}
