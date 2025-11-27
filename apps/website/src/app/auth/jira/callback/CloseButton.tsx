'use client'

interface CloseButtonProps {
  show: boolean
}

export default function CloseButton({ show }: CloseButtonProps) {
  if (!show) return null

  return (
    <div className="mt-6">
      <button
        onClick={() => window.close()}
        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Close Window
      </button>
    </div>
  )
}
