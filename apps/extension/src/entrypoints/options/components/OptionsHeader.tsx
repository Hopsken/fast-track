import logoUrl from '~/assets/logo.png'

interface OptionsHeaderProps {
  version: string
}

export function OptionsHeader({ version }: OptionsHeaderProps) {
  return (
    <header className="mb-8 flex items-center">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} className="h-12 w-12 rounded-xl" alt="Fast Track" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-3xl font-bold">Fast Track</h1>
          </div>
          <p className="text-muted-foreground">v{version} Settings</p>
        </div>
      </div>
    </header>
  )
}
