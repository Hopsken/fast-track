import { cn } from '@internal/ui/lib/utils'
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

const chapters = [
  {
    step: '01',
    eyebrow: 'Find the right work',
    title: 'Find the right issue fast.',
    description:
      'Open the popup, search issues, and get to the ticket you need without digging through Jira first.',
    align: 'right' as const,
    visual: (
      <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] bg-stone-50 p-5 md:p-8">
        <div className="w-full max-w-md overflow-hidden rounded-[1.4rem] border border-stone-200 bg-white shadow-[0_20px_50px_-36px_rgba(28,28,28,0.28)]">
          <div className="border-b border-stone-100 px-4 py-3">
            <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800">
              <span className="text-stone-500">Search issues</span>
              <span className="h-4 w-px animate-pulse bg-stone-900 motion-reduce:hidden" />
            </div>
          </div>
          <div className="space-y-2 p-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-[11px] font-semibold tracking-[0.16em] text-stone-700">
                  BUG
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-36 rounded-full bg-stone-200" />
                  <div className="h-2 w-20 rounded-full bg-stone-100" />
                </div>
              </div>
            </div>
            <div className="rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-stone-100 text-[11px] font-semibold tracking-[0.16em] text-stone-700">
                  DOC
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded-full bg-stone-200" />
                  <div className="h-2 w-16 rounded-full bg-stone-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    step: '02',
    eyebrow: 'Move work forward',
    title: 'Keep work moving from the same place.',
    description:
      'Once you have the issue, stay in the popup to open it, review recent work, and take the next step.',
    align: 'left' as const,
    visual: (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top,rgba(28,28,28,0.06),transparent_62%)] p-5 md:p-8">
        <Image
          src={commandsImage}
          alt="Fast Track command palette showing recent tickets and quick actions"
          className="h-auto w-full rounded-[1.3rem] border border-stone-200 bg-white shadow-[0_22px_60px_-40px_rgba(28,28,28,0.3)]"
        />
      </div>
    )
  },
  {
    step: '03',
    eyebrow: 'Repeat work without retyping',
    title: 'Make repeat tickets one step.',
    description:
      'Save templates for repeat work so scope, fields, and defaults are ready before you start typing.',
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
  }
] as const

export function Features() {
  return (
    <section className="overflow-hidden bg-white py-24 sm:py-28">
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

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            How it works
          </p>
          <div className="mt-4 max-w-3xl">
            <h2 className="text-balance font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              One popup. Three faster steps.
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-stone-600">
              Find the right issue, act on it, and reuse the work that repeats.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl space-y-20 sm:space-y-24">
          {chapters.map((chapter) => (
            <article
              key={chapter.step}
              className={cn(
                'grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-16',
                chapter.align === 'left' &&
                  'lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]'
              )}>
              <div
                className={cn(
                  'order-2',
                  chapter.align === 'right' ? 'lg:order-1' : 'lg:order-2'
                )}>
                <div className="border-t border-stone-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {chapter.step} / {chapter.eyebrow}
                  </p>
                  <h3 className="mt-4 max-w-md text-balance font-serif text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
                    {chapter.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-pretty text-base leading-7 text-stone-600 sm:text-lg">
                    {chapter.description}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  'order-1',
                  chapter.align === 'right' ? 'lg:order-2' : 'lg:order-1'
                )}>
                <div className="aspect-[4/3] w-full overflow-hidden">
                  {chapter.visual}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
