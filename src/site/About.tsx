import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import officePhoto from '../assets/images/about-office.jpg'
import { aboutCopy, features } from '../data/content'
import { ButtonLink, Eyebrow } from './ui/Button'

// Real, verifiable facts only — no invented patient counts or satisfaction
// percentages (the live site publishes neither). Matches the trio already
// verified against the live mirror in the previous build.
const stats = [
  { value: '4', label: 'Specialty areas' },
  { value: '2', label: 'Doctors on staff' },
  { value: 'ES / EN', label: 'Bilingual care' },
]

const ease = [0.2, 0.7, 0.2, 1] as const

// Hidden per client request (2026-09-27) — content/design kept as-is, not
// deleted, since it'll come back soon. Flip these back to true to restore.
const SHOW_STATS_AND_PHILOSOPHY = false
const SHOW_FEATURE_STRIP = false

export default function About() {
  const section = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // Scroll-linked text reveal (muted → bright) as the section enters the
  // upper viewport — the restrained, non-pinned version of the reference's
  // "Performance Proven at Scale" treatment. Plain fade for reduced motion.
  const { scrollYProgress } = useScroll({ target: section, offset: ['start 0.9', 'start 0.4'] })
  const revealInset = useTransform(scrollYProgress, [0, 1], [100, 0])
  const clipPath = useTransform(revealInset, (v) => `inset(0 ${v}% 0 0)`)

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: reduce ? 0 : 0.7, ease, delay: reduce ? 0 : delay },
  })

  return (
    // Solid brand cyan — the same colour as the primary buttons, not a
    // dark tint of it. Everything below is flipped to dark ink text/borders
    // for contrast, the same inversion already used on the full-screen menu.
    // Rounded top + upward shadow + higher stacking order than Hero (see
    // Hero.tsx's `sticky` note) — this whole section rises up the page and
    // covers Hero like a curtain being pulled up over it. Rounded bottom
    // too, so it reads as a full rounded panel floating on the dark page
    // rather than only curved on the one edge.
    <section
      ref={section}
      id="about"
      aria-labelledby="about-title"
      className="relative z-10 overflow-hidden rounded-[2.5rem] bg-cyan shadow-[0_-40px_70px_rgba(0,0,0,0.45)]"
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <motion.div {...rise()} className="relative">
            {/* Bigger, and the larger of the two columns now — with the
                stats/philosophy hidden (see the SHOW_ flags above) there's
                real room for the photo to take the lead here. */}
            <div className="aspect-[4/3] overflow-hidden rounded-[14px] ring-1 ring-ink/15">
              <img
                src={officePhoto}
                alt="A consultation room inside the Idea Dental practice"
                width={1450}
                height={1085}
                loading="lazy"
                className="h-full w-full object-cover grayscale-[45%] contrast-105"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
            </div>
            {/* Dark glow rather than the cyan one used on dark sections — a
                cyan glow would be invisible against this section's own
                solid cyan background. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -left-5 -z-10 aspect-square w-40 rounded-full bg-[radial-gradient(circle,rgb(11_13_14/0.25),transparent_65%)]"
            />
          </motion.div>

          <div className="flex flex-col justify-center">
            <motion.div {...rise(0.08)}>
              <Eyebrow tone="light">About Idea Dental</Eyebrow>
            </motion.div>

            <h2
              id="about-title"
              className="relative mt-5 max-w-[26ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.16] font-light tracking-[-0.02em]"
            >
              <span aria-hidden="true" className="text-ink/35">
                {aboutCopy.intro}
              </span>
              <motion.span
                style={reduce ? undefined : { clipPath }}
                initial={reduce ? { opacity: 0 } : undefined}
                whileInView={reduce ? { opacity: 1 } : undefined}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="absolute inset-0 text-ink"
              >
                {aboutCopy.intro}
              </motion.span>
            </h2>

            {SHOW_STATS_AND_PHILOSOPHY && (
              <>
                <motion.dl {...rise(0.16)} className="mt-6 flex flex-wrap gap-x-9 gap-y-3">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="font-display text-2xl font-medium text-ink">{s.value}</dd>
                      <dd className="mt-1 text-[13px] text-ink/60">{s.label}</dd>
                    </div>
                  ))}
                </motion.dl>

                <motion.p {...rise(0.24)} className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink/70">
                  {aboutCopy.philosophy}
                </motion.p>
              </>
            )}

            <motion.div {...rise(0.32)} className="mt-6">
              <ButtonLink href="#services" variant="onCyan" arrow>
                See our services
              </ButtonLink>
            </motion.div>
          </div>
        </div>

        {/* Horizontal scroll strip below lg: — a single row you swipe
            through, not five stacked cards — is what actually lets this
            section come close to fitting one screen on a phone. At lg: it
            settles back into the plain 5-column grid. */}
        {SHOW_FEATURE_STRIP && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:mt-7 lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...rise(0.06 * i)}
                className="w-[220px] shrink-0 rounded-[14px] border border-line bg-graphite/60 p-4 transition-colors duration-300 hover:border-white/20 hover:bg-graphite-2 lg:w-auto lg:shrink"
              >
                <p className="text-xs text-mute tabular-nums">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 font-display text-[15px] font-medium text-bone">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bone/55">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
