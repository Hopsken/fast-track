import { cn } from '@internal/ui/lib/utils'
import { Search, Command, FileText } from 'lucide-react'
import Image from 'next/image'

import commandsImage from '../../assets/commands.png'
import issueTemplatePickerImage from '../../assets/issue-template-picker.png'
import issueTemplateReviewImage from '../../assets/issue-template-review.png'

const issueTemplateSlides = [
  {
    image: issueTemplatePickerImage,
    alt: 'Fast Track issue template picker listing Bug triage, Release follow-up, and Customer escalation'
  },
  {
    image: issueTemplateReviewImage,
    alt: 'Fast Track review screen with a prefilled bug triage issue ready to create'
  }
] as const

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
    title: 'Quick create from issue templates',
    description:
      'Pick a template and ship a fully formed issue in seconds. Scope, defaults, and repeated fields are already filled, so you start from structure instead of another blank Jira form.',
    icon: FileText,
    align: 'right' as const,
    visual: (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(28,28,28,0.04),transparent_58%)] p-4 md:p-6">
        <div className="w-full max-w-4xl">
          <div
            className="relative overflow-hidden rounded-[1.4rem] border border-stone-200/90 bg-white shadow-[0_22px_60px_-38px_rgba(28,28,28,0.32)]"
            style={{ aspectRatio: '1154 / 740' }}>
            {issueTemplateSlides.map((slide, index) => (
              <div
                key={slide.alt}
                className={cn(
                  'absolute inset-0 motion-reduce:first:relative motion-reduce:first:block',
                  index === 0 ? 'opacity-100' : 'opacity-0',
                  index === 1 && 'motion-reduce:hidden'
                )}
                style={{
                  animation: `issue-template-slide 8s ease-in-out infinite`,
                  animationDelay: `${index * 4}s`
                }}>
                <figure className="absolute inset-0 overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full object-cover object-center"
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                </figure>
              </div>
            ))}
          </div>

          <div className="hidden justify-center pt-4 motion-reduce:hidden sm:flex">
            <div className="flex items-center gap-2">
              {issueTemplateSlides.map((slide, index) => (
                <span
                  key={slide.alt}
                  className="h-1.5 w-10 overflow-hidden rounded-full bg-stone-200">
                  <span
                    className="block h-full w-full origin-left rounded-full bg-stone-900/80"
                    style={{
                      animation: `issue-template-progress 8s linear infinite`,
                      animationDelay: `${index * 4}s`
                    }}
                  />
                </span>
              ))}
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
      <style>{`
        @keyframes issue-template-slide {
          0%, 42% {
            opacity: 1;
            transform: scale(1);
          }

          50%, 92% {
            opacity: 0;
            transform: scale(1.004);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes issue-template-progress {
          0% {
            transform: scaleX(0);
            opacity: 1;
          }

          42% {
            transform: scaleX(1);
            opacity: 1;
          }

          50%, 100% {
            transform: scaleX(1);
            opacity: 0.22;
          }
        }
      `}</style>
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
              <div className="aspect-square w-full overflow-hidden md:aspect-[4/3]">
                {feature.visual}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
