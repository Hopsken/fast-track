import { cn } from '@internal/ui/lib/utils'
import { Search, Zap, Command, GitBranch, User, ArrowRight } from 'lucide-react'
import Image from 'next/image'

import commandsImage from '../../assets/commands.png'

const features = [
  {
    title: 'Master your board without a mouse',
    description:
      'Alt+J is all you need. Access recent tickets, jump to boards, or run transitions instantly. It’s the command line experience for your issue tracker.',
    icon: Command,
    align: 'left' as const,
    visual: (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-stone-100 p-8">
        <Image
          src={commandsImage}
          alt="Command Palette Interface"
          className="h-auto w-full rounded-lg border border-stone-200 shadow-xl"
        />
      </div>
    )
  },
  {
    title: 'Automations that anticipate your next move',
    description:
      'Why repeat yourself? Fast Track handles the tedious stuff: automatically copying branch names on transition, or assigning tickets to yourself when you start working.',
    icon: Zap,
    align: 'right' as const,
    visual: (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-stone-100 bg-stone-50 p-8">
        <div className="flex w-full max-w-sm flex-col gap-4">
          {/* Step 1: Trigger */}
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-600">
                <Command className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-stone-900">
                  Transition to &quot;In Progress&quot;
                </div>
                <div className="text-xs text-stone-500">User Action</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 rotate-90 text-stone-300" />
          </div>

          {/* Step 2: Automation */}
          <div className="space-y-3 rounded-lg border border-stone-800 bg-stone-900 p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                <User className="h-3 w-3 text-green-400" />
              </div>
              <span className="text-sm text-stone-200">
                Auto-assigned to you
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                <GitBranch className="h-3 w-3 text-purple-400" />
              </div>
              <span className="text-sm text-stone-200">
                Branch name copied to clipboard
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Search at the speed of thought',
    description:
      'Skip the slow page loads. Type "jj" followed by your query in the address bar to instantly find tickets, boards, and filters. It’s faster than bookmarking.',
    icon: Search,
    align: 'left' as const,
    visual: (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-stone-100 p-8">
        <div className="w-full max-w-md transform overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex h-10 items-center border-b border-stone-100 bg-stone-50 px-3">
            <div className="flex flex-1 items-center gap-2 rounded border border-stone-200 bg-white px-2 py-1 text-sm text-stone-800 shadow-sm">
              <span className="rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-xs font-bold text-stone-600">
                j
              </span>
              <span>BUG-123</span>
              <span className="ml-0.5 h-4 w-[1px] animate-pulse bg-stone-900" />
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-600">
                BUG
              </div>
              <div>
                <div className="mb-1.5 h-3 w-48 rounded bg-stone-200" />
                <div className="h-2 w-24 rounded bg-stone-100" />
              </div>
            </div>
            <div className="h-2 w-full rounded bg-stone-50" />
            <div className="h-2 w-2/3 rounded bg-stone-50" />
          </div>
        </div>
      </div>
    )
  }
]

export function Features() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto space-y-32 px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col gap-16 lg:items-center',
              feature.align === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'
            )}>
            <div className="flex-1 space-y-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-900 shadow-sm">
                <feature.icon className="h-6 w-6" />
              </div>
              <h2 className="text-balance font-serif text-4xl font-medium leading-tight tracking-tight text-stone-900">
                {feature.title}
              </h2>
              <p className="max-w-lg text-pretty text-lg leading-relaxed text-stone-600">
                {feature.description}
              </p>
            </div>

            <div className="flex-1">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-md md:aspect-[4/3]">
                {feature.visual}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
