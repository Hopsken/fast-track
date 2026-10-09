import Image from 'next/image'
import Link from 'next/link'

import logoUrl from '../../assets/logo.png'

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-[#FDFBF9] pb-12 pt-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-stone-900 text-white">
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
            <p className="max-w-xs text-sm leading-relaxed text-stone-500">
              The developer-first Jira extension for frictionless issue
              management.
            </p>
          </div>

          <nav aria-label="Footer" className="md:pt-1">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-600">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-stone-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200/60 pt-8 md:flex-row">
          <div className="text-xs text-stone-400">
            © {new Date().getFullYear()} Fast Track. All rights reserved.
          </div>
          <div className="flex gap-6">{/* Social icons could go here */}</div>
        </div>
      </div>
    </footer>
  )
}
