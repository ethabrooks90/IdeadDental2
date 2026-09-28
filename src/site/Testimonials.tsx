import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { testimonials } from '../data/content'
import { Eyebrow } from './ui/Button'

const ease = [0.2, 0.7, 0.2, 1] as const
// Reading time after a review has finished typing — the auto-advance timer
// only starts once typing is done, so a long review isn't cut off mid-read.
const SLIDE_MS = 7000
const TYPE_MS = 24

// The four real reviews, shown in full and unedited, standing on their own —
// deliberately not paired with before/after photos (see sections.ts: the
// reviews don't name a procedure, so any pairing would imply a claim).
export default function Testimonials() {
  const reduce = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const inView = useInView(section, { amount: 0.3 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  // No auto-rotation at all under reduced motion; otherwise it holds while
  // the reader is pointing at it, focused inside it, or it's off screen.
  const autoplay = !reduce && !userPaused
  const running = autoplay && !hovered && !focused && inView
  const count = testimonials.length
  const review = testimonials[active]

  // Typewriter: the review types out character by character once the
  // section is on screen. Stored with the review it belongs to, so switching
  // reviews starts the new one from 0 without a reset effect. Reduced motion
  // skips straight to the full text.
  const [typing, setTyping] = useState({ index: 0, chars: 0 })
  const chars = reduce ? review.quote.length : typing.index === active ? typing.chars : 0
  const typed = chars >= review.quote.length
  useEffect(() => {
    if (reduce || !inView || typed) return
    const id = window.setInterval(() => {
      setTyping((t) => {
        const n = (t.index === active ? t.chars : 0) + 1
        return { index: active, chars: Math.min(n, testimonials[active].quote.length) }
      })
    }, TYPE_MS)
    return () => window.clearInterval(id)
  }, [active, inView, reduce, typed])

  const go = (i: number) => setActive((i + count) % count)

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null
    if (next === null) return
    e.preventDefault()
    const target = (next + count) % count
    go(target)
    tabRefs.current[target]?.focus()
  }

  return (
    <section
      ref={section}
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-ink"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="flex flex-col">
            <Eyebrow>Patient reviews</Eyebrow>
            <h2
              id="testimonials-title"
              className="mt-5 max-w-[14ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-bone"
            >
              What patients say
            </h2>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-bone/55">
              In their own words, unedited. You can find more of our reviews on Google, Facebook and Yelp.
            </p>

            <div className="mt-8 flex items-center gap-5 lg:mt-auto">
              <p className="font-display text-sm text-bone/70 tabular-nums" aria-hidden="true">
                {String(active + 1).padStart(2, '0')}
                <span className="text-bone/30"> / {String(count).padStart(2, '0')}</span>
              </p>
              <div className="flex gap-2">
                <ArrowButton label="Previous review" dir="prev" onClick={() => go(active - 1)} />
                <ArrowButton label="Next review" dir="next" onClick={() => go(active + 1)} />
              </div>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'Resume review rotation' : 'Pause review rotation'}
                  className="grid size-9 place-items-center rounded-md text-bone/60 transition-colors duration-300 hover:text-bone"
                >
                  {userPaused ? (
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                      <path d="M4.5 3v10l8-5-8-5Z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                      <path d="M5 3h2v10H5zM9 3h2v10H9z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active}`}
            // Announce changes only when they're user-driven; a rotating
            // live region would talk over the reader every 7 seconds.
            aria-live={running ? 'off' : 'polite'}
            className="relative min-h-[16rem] sm:min-h-[14rem]"
          >
            <svg aria-hidden="true" viewBox="0 0 48 36" className="mb-6 h-8 w-10 text-cyan">
              <path
                d="M0 36V21.6C0 9.8 6.3 2.6 18.9 0l2 4.3c-6.3 1.8-9.6 5.4-10.1 10.7H19V36H0Zm27.9 0V21.6C27.9 9.8 34.2 2.6 46.8 0l1.2 4.3c-6.3 1.8-9.6 5.4-10.1 10.7h8.1V36H27.9Z"
                fill="currentColor"
              />
            </svg>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={review.name}
                initial={{ opacity: 0, y: reduce ? 0 : 14, filter: reduce ? 'blur(0px)' : 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: reduce ? 0 : -10, filter: reduce ? 'blur(0px)' : 'blur(4px)' }}
                transition={{ duration: reduce ? 0 : 0.5, ease }}
              >
                {/* Typed text sits over an invisible copy of the full review,
                    so the block is its final height from the first letter (no
                    layout jump). Screen readers get the full review at once;
                    the typing layer is hidden from them. */}
                <blockquote className="grid max-w-[34ch] font-display text-[clamp(1.5rem,2.7vw,2.5rem)] leading-[1.22] font-light tracking-[-0.015em] text-bone">
                  <span className="invisible col-start-1 row-start-1">{review.quote}</span>
                  <span className="sr-only">{review.quote}</span>
                  <span aria-hidden="true" className="col-start-1 row-start-1">
                    {review.quote.slice(0, chars)}
                    {!typed && (
                      <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] animate-pulse bg-cyan [animation-duration:0.9s]" />
                    )}
                  </span>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 text-sm">
                  <span className="grid size-9 place-items-center rounded-full bg-graphite-2 font-display text-[13px] text-bone/80 ring-1 ring-line">
                    {review.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-medium text-bone">{review.name}</span>
                    <span className="block text-[13px] text-mute">Idea Dental patient</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>

        <div role="tablist" aria-label="Patient reviews" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 lg:mt-20 lg:grid-cols-4 lg:gap-x-6">
          {testimonials.map((t, i) => {
            const selected = i === active
            return (
              <button
                key={t.name}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                id={`${baseId}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className="group text-left"
              >
                <span aria-hidden="true" className="relative block h-px overflow-hidden bg-line">
                  {selected && (
                    <span
                      key={active}
                      className="absolute inset-0 origin-left bg-cyan"
                      // Timer only starts once the review has finished typing.
                      style={
                        autoplay && typed
                          ? {
                              animation: `review-progress ${SLIDE_MS}ms linear forwards`,
                              animationPlayState: running ? 'running' : 'paused',
                            }
                          : autoplay
                            ? { transform: 'scaleX(0)' }
                            : undefined
                      }
                      onAnimationEnd={autoplay && typed ? () => go(active + 1) : undefined}
                    />
                  )}
                </span>
                <span
                  className={`mt-4 block text-[13px] tabular-nums transition-colors duration-300 ${selected ? 'text-cyan' : 'text-bone/30 group-hover:text-bone/50'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`mt-1.5 block font-display text-[15px] transition-colors duration-300 ${selected ? 'text-bone' : 'text-bone/45 group-hover:text-bone/75'}`}
                >
                  {t.name}
                </span>
                <span
                  className={`mt-1 block text-[13px] transition-colors duration-300 ${selected ? 'text-bone/60' : 'text-bone/30 group-hover:text-bone/45'}`}
                >
                  {t.headline}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ArrowButton({ label, dir, onClick }: { label: string; dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-md border border-white/15 text-bone transition-colors duration-300 hover:border-bone hover:bg-bone hover:text-ink"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-3.5 ${dir === 'prev' ? 'rotate-180' : ''}`}>
        <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  )
}
