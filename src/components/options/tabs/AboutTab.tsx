import { AboutSection } from "../sections/AboutSection"

interface AboutTabProps {
  version: string
}

export function AboutTab({ version }: AboutTabProps) {
  return (
    <div className="space-y-8">
      <AboutSection version={version} />
    </div>
  )
}