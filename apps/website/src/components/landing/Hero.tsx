'use client'

import { Button } from '@internal/ui/components/button'
import { motion } from 'motion/react'
import Image from 'next/image'

import heroImage from '../../assets/hero.png'

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-32">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}>
            <h1 className="mb-8 text-balance font-serif text-5xl font-medium leading-[1.1] tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
              Jira, without <br />
              <span className="italic text-stone-600">the friction.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-xl font-light leading-relaxed text-stone-600">
              Stop clicking through endless menus. Search, transition, and
              manage tickets directly from your keyboard. Built for developers
              who value flow.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full bg-stone-900 px-8 text-base text-white shadow-xl shadow-stone-900/10 hover:bg-stone-800"
                asChild>
                <a
                  href="https://chromewebstore.google.com/detail/jira-boost/cmlkcfgkffidbnpbjmlgplokcacfemhp"
                  target="_blank"
                  rel="noreferrer">
                  Add to Chrome — It's Free
                </a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Browser Mockup */}
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
          <Image
            src={heroImage}
            alt="Fast Track Extension Interface"
            className="h-auto w-full rounded-xl border border-stone-200 shadow-2xl shadow-stone-900/10"
            width={1000}
            height={620}
            priority
            placeholder="blur"
          />
        </motion.div>
      </div>
    </section>
  )
}
