import { Metadata } from 'next'

import { Features } from '../components/landing/Features'
import { Footer } from '../components/landing/Footer'
import { Header } from '../components/landing/Header'
import { Hero } from '../components/landing/Hero'

export const metadata: Metadata = {
  description:
    'Fast Track helps you search, open, and manage Jira issues without breaking flow.',
  title: 'Fast Track | Accelerated Jira workflow'
}

export default function Index() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </main>
  )
}
