import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { business, pricing } from '../data/content'
import { ButtonLink, Eyebrow } from './ui/Button'

const ease = [0.2, 0.7, 0.2, 1] as const

// The practice's own updated price list (2026-10-01), sent by the practice —
// approved for publishing. The old table's unsourced "Other dentist"
// comparison is gone, which was the only reason it was held back.

// Facts only, all already published on the live site (FAQ + services pages).
const points = [
  { title: 'All insurance plans', body: 'We accept all insurance plans.' },
  { title: 'Payment plans', body: 'Flexible payment options for every patient, including payment plans for orthodontic treatment.' },
  { title: 'Questions about cost?', body: `Call or text us at ${business.phone}.` },
]

export default function Insurance() {
  const reduce = useReducedMotion() ?? false
  // Reveal keyed off the unclipped intro block (see ToothExplorer.tsx).
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })

  return (
    <section id="insurance" aria-labelledby="insurance-title" className="border-t border-line bg-ink">
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:py-28">
        <div ref={intro}>
          <Eyebrow>Insurance &amp; payment</Eyebrow>
          <motion.h2
            id="insurance-title"
            initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
            animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
            transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
            className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.02] font-light tracking-[-0.03em] text-bone"
          >
            We accept all <span className="text-cyan">insurance plans.</span>
          </motion.h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-16">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduce ? 0 : 0.6, ease, delay: reduce ? 0 : i * 0.08 }}
              className="rounded-[1.25rem] border border-line bg-graphite/60 p-6 transition-colors duration-300 hover:border-white/20 hover:bg-graphite-2 sm:p-7"
            >
              <p className="text-[13px] text-cyan tabular-nums">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-6 font-display text-lg font-medium text-bone sm:text-xl">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-bone/60">{p.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#contact" arrow>
            Request an appointment
          </ButtonLink>
          <ButtonLink href={business.phoneHref} variant="secondary">
            Call or text {business.phone}
          </ButtonLink>
        </div>

        <PriceList reduce={reduce} />
      </div>
    </section>
  )
}

function PriceList({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduce ? 0 : 0.7, ease }}
      // Only this block is light (client request): a #F2F0EF paper card on
      // the dark section, dark ink text, cyan-ink prices for contrast.
      className="mt-20 rounded-[1.5rem] bg-paper p-5 text-ink sm:p-8 lg:mt-28"
    >
      <h3 className="font-display text-2xl font-light tracking-[-0.02em] text-ink sm:text-3xl">Our prices</h3>

      {/* Two columns on wide screens so 13 items don't make one very tall
          list; one column on phones. */}
      <dl className="mt-6 grid gap-x-12 sm:mt-8 lg:grid-cols-2">
        {pricing.map((row) => (
          <div
            key={row.item}
            className="flex items-baseline justify-between gap-4 border-b border-ink/12 py-3.5 transition-colors duration-300 hover:bg-ink/[0.03] sm:py-4"
          >
            <dt className="font-display text-[15px] text-ink sm:text-lg">{row.item}</dt>
            <dd className="shrink-0 text-right font-display text-[15px] text-cyan-ink tabular-nums sm:text-lg">{row.price}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  )
}
