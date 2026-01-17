import React from 'react'
import { cn } from '@internal/ui/lib/utils'
import { Inter, Crimson_Pro } from 'next/font/google'

import './global.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '600', '700'] // Regular, SemiBold, Bold
})

export const metadata = {
  title: 'Fast Track',
  description: 'Jira workflow assistance and streamlined ticket search'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, crimsonPro.variable)}>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/png" />
      </head>
      <body className="bg-[#FDFBF9] font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}
