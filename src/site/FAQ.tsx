import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { business, faqs } from '../data/content'
import { ButtonLink, Eyebrow } from './ui/Button'
import { Collapse } from './ui/Collapse'

const ease = [0.2, 0.7, 0.2, 1] as const

// Answers are condensed from the live site's own pages (see content.ts), but
// still need the practice's sign-off. Unlike the price table this isn't
// held back from the published site — it's flagged in local preview only,
// as a reminder, until ANSWERS_SIGNED_OFF is flipped.
const ANSWERS_SIGNED_OFF = false

const categories = [...new Set(faqs.map((f) => f.category))]

export default function FAQ() {
  const reduce = useReducedMotion() ?? false
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })
  const searchId = useId()

  const [category, setCategory] = useState(categories[0])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  // A search looks across every category; otherwise show the chosen one.
  const q = query.trim().toLowerCase()
  const list = useMemo(
    () => (q ? faqs.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q)) : faqs.filter((f) => f.category === category)),
    [q, category],
  )

  const pickCategory = (c: string) => {
    setCategory(c)
    setQuery('')
    setOpen(null)
  }

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-28">
        {/* Left column stays in view while the list scrolls on desktop. */}
        <div ref={intro} className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          {/* Reveal keyed off the unclipped intro block (see ToothExplorer.tsx). */}
          <motion.h2
            id="faq-title"
            initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
            animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
            transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
            className="mt-5 max-w-[14ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-bone"
          >
            Frequently asked questions
          </motion.h2>

          <label htmlFor={searchId} className="sr-only">
            Search questions
          </label>
          <div className="relative mt-8">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mute">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(null)
              }}
              placeholder="Search questions"
              className="h-11 w-full max-w-sm rounded-md border border-white/15 bg-white/[0.03] pr-3 pl-10 text-sm text-bone placeholder:text-mute focus:border-cyan focus:outline-none"
            />
          </div>

          <div role="group" aria-label="Question categories" className="mt-6 flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1">
            {categories.map((c) => {
              const selected = !q && c === category
              const count = faqs.filter((f) => f.category === c).length
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => pickCategory(c)}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 lg:rounded-md lg:px-3 lg:py-2 lg:text-[15px] ${
                    selected ? 'bg-bone text-ink lg:bg-white/[0.06] lg:text-bone' : 'text-bone/60 ring-1 ring-white/10 hover:text-bone lg:ring-0'
                  }`}
                >
                  {selected && <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-cyan lg:block" />}
                  {c}
                  <span className={`tabular-nums ${selected ? 'text-ink/50 lg:text-mute' : 'text-mute'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-10 hidden lg:block">
            <p className="text-[15px] text-bone/60">Still have a question?</p>
            <ButtonLink href={business.phoneHref} variant="secondary" size="sm" className="mt-3">
              Call or text {business.phone}
            </ButtonLink>
          </div>
        </div>

        <div>
          {import.meta.env.DEV && !ANSWERS_SIGNED_OFF && (
            <p className="mb-6 rounded-md border border-dashed border-amber-300/50 px-3 py-2 text-[12px] text-amber-200/90">
              <span className="mr-2 font-medium tracking-[0.1em] uppercase">Pending sign-off</span>
              Answers are condensed from the live site — confirm with the practice. (Local preview only.)
            </p>
          )}

          <p aria-live="polite" className="mb-2 text-[12px] tracking-[0.16em] text-mute uppercase">
            {q ? `${list.length} ${list.length === 1 ? 'result' : 'results'} for “${query.trim()}”` : category}
          </p>

          {list.length === 0 ? (
            <p className="border-t border-line py-8 text-[15px] text-bone/60">
              No questions match that search. Try another word, or call or text us at{' '}
              <a href={business.phoneHref} className="text-bone underline underline-offset-4">
                {business.phone}
              </a>
              .
            </p>
          ) : (
            <ul className="border-t border-line">
              {list.map((f, i) => (
                <QuestionRow
                  key={f.question}
                  index={i}
                  question={f.question}
                  answer={f.answer}
                  category={q ? f.category : null}
                  open={open === f.question}
                  onToggle={() => setOpen(open === f.question ? null : f.question)}
                />
              ))}
            </ul>
          )}

          <div className="mt-10 lg:hidden">
            <p className="text-[15px] text-bone/60">Still have a question?</p>
            <ButtonLink href={business.phoneHref} variant="secondary" size="sm" className="mt-3">
              Call or text {business.phone}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuestionRow({
  index,
  question,
  answer,
  category,
  open,
  onToggle,
}: {
  index: number
  question: string
  answer: string
  category: string | null
  open: boolean
  onToggle: () => void
}) {
  const panelId = useId()
  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-start gap-5 py-5 text-left"
      >
        <span className={`mt-1 w-6 shrink-0 text-[13px] tabular-nums transition-colors ${open ? 'text-cyan' : 'text-mute'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          {category && <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">{category}</span>}
          <span
            className={`block font-display text-[17px] leading-snug transition-colors duration-300 sm:text-lg ${
              open ? 'text-bone' : 'text-bone/75 group-hover:text-bone'
            }`}
          >
            {question}
          </span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`mt-1.5 size-4 shrink-0 text-mute transition-transform duration-300 ease-(--ease-out-soft) ${open ? 'rotate-45 text-cyan' : ''}`}
        >
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <Collapse open={open} id={panelId}>
        <p className="max-w-2xl pr-9 pb-6 pl-11 text-[15px] leading-relaxed text-bone/60">{answer}</p>
      </Collapse>
    </li>
  )
}
