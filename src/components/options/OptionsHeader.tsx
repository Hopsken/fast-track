import logoUrl from "~/assets/logo.png"

interface OptionsHeaderProps {
  version: string
}

export function OptionsHeader({ version }: OptionsHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} className="w-12 h-12" alt="Jira Boost" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jira Boost</h1>
          <p className="text-gray-600">v{version} Settings</p>
        </div>
      </div>
    </header>
  )
}