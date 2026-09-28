import { lazy, Suspense, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { serviceCategories, toothParts } from '../data/content'
import type { ToothPartKey } from './hero/toothGeometry'
import { canUseWebGL } from './hero/webgl'
import { Eyebrow } from './ui/Button'

const ExplorerScene = lazy(() => import('./anatomy/ExplorerScene'))

const ease = [0.2, 0.7, 0.2, 1] as const

const SHOW_CREDIT_UNDER_MODEL = false

export default function ToothExplorer() {
  const reduce = useReducedMotion() ?? false
  const section = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const [active, setActive] = useState<ToothPartKey>('enamel')

  // The 3D model is the heavy part of this page (WebGL start-up alone is a
  // measured ~1s+ on devices without a GPU), so it isn't even fetched until
  // the section is close, and browsers without WebGL get the list-and-panel
  // version only.
  const near = useInView(section, { once: true, margin: '600px 0px' })
  // Watched on the unclipped text column, not the heading itself: the
  // heading starts fully clipped (inset 100%), which the browser treats as
  // zero visible area, so an in-view check on it never fires.
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })
  // Shown on phones too (client request) — still lazy-loaded only once the
  // section is near, and skipped only where WebGL isn't available.
  const [show3D] = useState(() => canUseWebGL())

  const index = toothParts.findIndex((p) => p.key === active)
  const part = toothParts[index]
  const service = serviceCategories.find((c) => c.key === part.service)!

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const count = toothParts.length
    const map: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: count - 1 }
    if (!(e.key in map)) return
    e.preventDefault()
    const next = (map[e.key] + count) % count
    setActive(toothParts[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    // Light paper surface (client request) — text flips to dark ink, cyan
    // text uses the darker cyan-ink for contrast, and the 3D stage stays a
    // dark card so the white tooth still stands out.
    // Top half of one continuous paper panel that runs on through Our
    // technology below (see Technology.tsx), rounded at its outer corners.
    // relative z-10 + upward shadow: this panel is the "curtain" that rises
    // over What we offer's service list (see the curtain note in Services.tsx),
    // the same way About rises over the Hero.
    <section
      ref={section}
      id="anatomy"
      aria-labelledby="anatomy-title"
      className="relative z-10 rounded-t-[2.5rem] bg-paper text-ink shadow-[0_-40px_70px_rgba(0,0,0,0.45)]"
    >
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-x-16 lg:gap-y-0 lg:py-28">
        <div ref={intro} className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <Eyebrow tone="light">Tooth explorer</Eyebrow>
          {/* Same entrance as the Hero/Services headlines. */}
          <motion.h2
            id="anatomy-title"
            initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
            animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
            transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
            className="mt-5 max-w-[16ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-ink"
          >
            Explore the tooth
          </motion.h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/65">
            Pick a part of the tooth to see what it is, and which area of our care it relates to.
            {show3D && ' Drag the model to turn it.'}
          </p>
        </div>

        {/* Phones read heading → model → parts list, so a tapped part lights
            up right next to the list instead of off-screen below it. */}
        {show3D && (
          <figure className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="relative h-[440px] overflow-hidden sm:h-[520px] rounded-[2rem] bg-ink shadow-[0_30px_80px_rgba(11,13,14,0.18)] lg:h-[680px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgb(0_169_221/0.14),transparent_70%)]"
            />
            <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-40" />
            {near && (
              <Suspense fallback={<p className="absolute inset-0 grid place-items-center text-sm text-mute">Loading model…</p>}>
                <ExplorerScene active={active} onSelect={setActive} reduce={reduce} />
              </Suspense>
            )}
            <p aria-hidden="true" className="pointer-events-none absolute bottom-5 left-6 text-[11px] tracking-[0.16em] text-mute uppercase">
              Drag to rotate
            </p>
          </div>
          {/* Hidden per client request (2026-09-28). The CC BY 4.0 credit this
              licence requires now lives in the footer instead (see
              Footer.tsx) — flip SHOW_CREDIT_UNDER_MODEL to bring
              it back here. */}
          {SHOW_CREDIT_UNDER_MODEL && (
          <figcaption className="mt-3 text-right text-[11px] text-ink/50">
            3D model:{' '}
            <a
              href="https://sketchfab.com/3d-models/maxillary-first-molar-with-two-root-canals-9481d0b5150b44f2bfbbb53b688cdf87"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink"
            >
              “Maxillary First Molar with Two Root Canals”
            </a>{' '}
            by University of Dundee, School of Dentistry ·{' '}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink"
            >
              CC BY 4.0
            </a>
          </figcaption>
          )}
          </figure>
        )}

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <div role="tablist" aria-label="Parts of the tooth" aria-orientation="vertical" className="border-t border-ink/12 lg:mt-10">
            {toothParts.map((p, i) => {
              const selected = p.key === active
              return (
                <button
                  key={p.key}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  id={`${baseId}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(p.key)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className="group relative flex w-full items-center gap-5 border-b border-ink/12 py-4 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 bottom-0 left-0 w-0.5 origin-top bg-cyan transition-transform duration-500 ease-(--ease-out-soft) ${
                      selected ? 'scale-y-100' : 'scale-y-0'
                    }`}
                  />
                  <span className={`w-6 pl-3 text-[13px] tabular-nums ${selected ? 'text-cyan-ink' : 'text-ink/40'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-display text-lg font-medium transition-colors duration-300 sm:text-xl ${
                      selected ? 'text-ink' : 'text-ink/45 group-hover:text-ink/80'
                    }`}
                  >
                    {p.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${index}`}
            aria-live="polite"
            className="mt-8 min-h-[9.5rem]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={part.key}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: reduce ? 0 : 0.35, ease }}
              >
                <p className="max-w-md text-[15px] leading-relaxed text-ink/80">{part.description}</p>
                <p className="mt-5 text-[11px] font-medium tracking-[0.16em] text-ink/50 uppercase">Related care</p>
                <a
                  href={`#service-${service.key}`}
                  className="group mt-2 inline-flex items-center gap-2 font-display text-base text-ink transition-colors duration-300 hover:text-cyan-ink"
                >
                  {service.label}
                  {part.relatedTreatment && <span className="text-[13px] text-ink/50">· includes {part.relatedTreatment}</span>}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="size-3.5 transition-transform duration-300 ease-(--ease-out-soft) group-hover:translate-x-0.5"
                  >
                    <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  )
}
