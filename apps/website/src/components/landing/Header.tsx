import { Button } from '@internal/ui/components/button'
import Image from 'next/image'
import Link from 'next/link'

import logoUrl from '../../assets/logo.png'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FDFBF9]/80 backdrop-blur-md">
      <div className="h-18 container mx-auto flex items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-stone-900 text-white transition-transform group-hover:scale-105">
              <Image
                src={logoUrl}
                alt="Fast Track Logo"
                width={32}
                height={32}
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-stone-900">
              Fast Track
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">
            Privacy
          </Link>
          <Button
            variant="default"
            size="sm"
            asChild
            className="rounded-full bg-stone-900 px-6 font-medium text-white shadow-none hover:bg-stone-800">
            <a
              href="https://chromewebstore.google.com/detail/jira-boost/cmlkcfgkffidbnpbjmlgplokcacfemhp"
              target="_blank"
              rel="noreferrer">
              Add to Chrome
            </a>
          </Button>
        </nav>
      </div>
    </header>
  )
}
