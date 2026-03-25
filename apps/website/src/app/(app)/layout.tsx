import type { ReactNode } from 'react'

import { Header } from '../../components/landing/Header'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#FDFBF9]">
      <Header />
      <main>{children}</main>
    </div>
  )
}
