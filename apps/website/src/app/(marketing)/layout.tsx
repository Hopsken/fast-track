import type { ReactNode } from 'react'

import { Footer } from '../../components/landing/Footer'
import { Header } from '../../components/landing/Header'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#FDFBF9]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
