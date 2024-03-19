import { HiLockClosed } from "react-icons/hi2"
import { Link } from "react-router-dom"

export function ProBadge({ isPro }: { isPro: boolean }) {
  return (
    <Link to={isPro ? "/manage-license" : "/upgrade"}>
      <div
        className={`rounded  cursor-pointer px-2 py-1 text-xs font-bold flex items-center justify-center ${
          isPro ? "text-amber-400 bg-gray-700" : "text-gray-500 bg-gray-200"
        }`}>
        <span>Pro</span>
        {!isPro && <HiLockClosed />}
      </div>
    </Link>
  )
}
