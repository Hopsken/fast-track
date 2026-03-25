import { Metadata } from 'next'

import { Faq } from '../components/landing/Faq'
import { Features } from '../components/landing/Features'
import { Footer } from '../components/landing/Footer'
import { Header } from '../components/landing/Header'
import { Hero } from '../components/landing/Hero'
import { PricingTeaser } from '../components/landing/PricingTeaser'

export const metadata: Metadata = {
  description:
    'Fast Track helps you find issues, move work forward, and reuse repeat work without digging through Jira.',
  title: 'Fast Track | Accelerated Jira workflow'
}

export default function Index() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <Hero />
      <Features />
      <PricingTeaser />
      <Faq />
      <Footer />
    </main>
  )
}
