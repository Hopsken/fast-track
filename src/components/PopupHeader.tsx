import { HiChevronLeft } from "react-icons/hi2"
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey } from "~storage"

import { ProBadge } from "./ProBadge"

export function PopupHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [license] = useStorage<LicenseState>(StorageKey.License)

  if (pathname === "/") {
    return (
      <header className="flex items-center space-x-2">
        <h1 className="text-lg font-medium text-slate-900">Jira Boost</h1>
        <ProBadge isPro={license?.valid} />
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
