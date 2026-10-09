import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@internal/ui/components/accordion'
import Link from 'next/link'

const faqItems = [
  {
    answer:
      'Yes. Search history and Jira responses stay on your device, and Fast Track does not sell or share that data.',
    question: 'Is Fast Track safe to use with my Jira data?'
  },
  {
    answer:
      'Fast Track uses browser storage scoped to the extension. Cached results stay local, and you can clear them from your browser settings.',
    question: 'How does Fast Track store my data?'
  },
  {
    answer: 'No. Install it and connect your Jira site. That is all.',
    question: 'Do I need an account?'
  },
  {
    answer: 'Yes. Every feature is free.',
    question: 'Is Fast Track free?'
  },
  {
    answer: 'No, not for now.',
    question: 'Any AI features?'
  }
] as const

export function Faq() {
  return (
    <section className="border-t border-stone-200/60 bg-[#FDFBF9] py-24 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              FAQ
            </p>
            <h2 className="mt-4 text-balance font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Before you install.
            </h2>
          </div>

          <Accordion
            type="single"
            collapsible
            className="mt-12 border-t border-stone-200">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.question}
                value={item.question}
                className="border-stone-200">
                <AccordionTrigger className="text-base leading-7 text-stone-900 no-underline hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pr-8 text-sm leading-7 text-stone-600 sm:text-[15px]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-6 text-sm leading-6 text-stone-500">
            Need more? Read the{' '}
            <Link
              href="/privacy"
              className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
