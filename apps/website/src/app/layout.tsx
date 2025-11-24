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
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/png" />
      </head>
      <body
        className={`${spaceGrotesk.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
