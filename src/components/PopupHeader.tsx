import { HiChevronLeft } from "react-icons/hi2"
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

export function PopupHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (pathname === "/") {
    return (
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-slate-900">Jira Boost</h1>
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
        </Route>
      </Routes>
    </header>
  )
}
