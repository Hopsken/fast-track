export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider">
      {children}
    </h2>
  )
}
