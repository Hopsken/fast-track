export function Footer({ error }: { error?: string }) {
  if (!error) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span>{error}</span>
    </div>
  )
}
