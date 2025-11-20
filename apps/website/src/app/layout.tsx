import { Space_Grotesk } from 'next/font/google'
import React from 'react'

import './global.css'

const spaceGrotesk = Space_Grotesk({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
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
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} bg-slate-950 text-slate-50`}
      >
        {children}
      </body>
    </html>
  )
}
