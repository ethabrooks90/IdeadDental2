import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { results } from '../data/content'
import backdrop from '../assets/images/results-bg.webp'

const ease = [0.2, 0.7, 0.2, 1] as const

const photos = import.meta.glob<string>('../assets/images/results/*.jpg', { eager: true, import: 'default' })
const photoFor = (key: string) => photos[`../assets/images/results/${key}.jpg`]

// "Traditional Braces — 9 months later" → ["Traditional Braces", "9 months later"].
const treatmentOf = (label: string) => label.split(' — ')[0]
const timeframeOf = (label: string) => label.split(' — ')[1]

// Every photo is the same 400×600 composite: title bar, the BEFORE shot
// (rows 34–273), a "Before" bar, the AFTER shot (rows 307–566), a caption
// bar. The round card preview crops to one shot by sizing the image so that
// shot's height fills the circle and offsetting it up. The full composite,
// captions and all, is what opens in the viewer.
const crop = (top: number, height: number) => ({
  height: `${(600 / height) * 100}%`,
  top: `${(-top / height) * 100}%`,
})
const AFTER = crop(307, 259)
const BEFORE = crop(34, 239)

export default function Results() {
  const reduce = useReducedMotion() ?? false
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })
  const track = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const treatments = useMemo(() => ['All', ...new Set(results.map((r) => treatmentOf(r.label)))], [])
  const [filter, setFilter] = useState('All')
  const shown = filter === 'All' ? results : results.filter((r) => treatmentOf(r.label) === filter)
  const [open, setOpen] = useState<number | null>(null)

  const scrollByCard = (dir: 1 | -1) => {
    const el = track.current
    const card = el?.querySelector<HTMLElement>('[data-card]')
    if (!el || !card) return
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduce ? 'auto' : 'smooth' })
  }

  // Click-and-drag to slide the cards with a mouse (touch already swipes
  // natively). Snapping is paused mid-drag so it doesn't fight the pointer,
  // then restored so the row settles on a card. A drag of more than a few
  // pixels doesn't count as a click, so letting go never opens the viewer.
  const dragged = useRef(false)
  const drag = useRef<{ x: number; left: number } | null>(null)
  const dragScroll = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft }
      dragged.current = false
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.x
      if (!dragged.current && Math.abs(dx) > 5) {
        dragged.current = true
        e.currentTarget.style.scrollSnapType = 'none'
        e.currentTarget.setPointerCapture(e.pointerId)
      }
      if (dragged.current) e.currentTarget.scrollLeft = d.left - dx
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return
      drag.current = null
      e.currentTarget.style.scrollSnapType = ''
      // Let the click that follows this pointerup see `dragged`, then reset.
      setTimeout(() => (dragged.current = false), 0)
    },
  }

  // Custom scroll bar: thumb width = visible share of the row, position =
  // how far along it is. Written straight to style from the scroll event.
  const bar = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const syncBar = () => {
    const el = track.current
    const t = thumb.current
    const b = bar.current
    if (!el || !t || !b) return
    const ratio = Math.min(1, el.clientWidth / el.scrollWidth)
    const max = el.scrollWidth - el.clientWidth
    const progress = max > 0 ? el.scrollLeft / max : 0
    const w = Math.max(28, b.clientWidth * ratio)
    t.style.width = `${w}px`
    // translateX only — the class's -translate-y-1/2 (CSS `translate`) still
    // does the vertical centring alongside it.
    t.style.transform = `translateX(${(b.clientWidth - w) * progress}px)`
    b.style.visibility = ratio >= 1 ? 'hidden' : 'visible'
  }
  useLayoutEffect(() => {
    syncBar()
    window.addEventListener('resize', syncBar)
    return () => window.removeEventListener('resize', syncBar)
  })
  const barDragging = useRef(false)
  const scrollToBar = (clientX: number) => {
    const el = track.current
    const b = bar.current
    if (!el || !b) return
    const r = b.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    el.style.scrollSnapType = 'none'
    el.scrollLeft = p * (el.scrollWidth - el.clientWidth)
  }
  const barDown = (e: React.PointerEvent<HTMLDivElement>) => {
    barDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    scrollToBar(e.clientX)
  }
  const barMove = (e: React.PointerEvent<HTMLDivElement>) => barDragging.current && scrollToBar(e.clientX)
  const barUp = () => {
    barDragging.current = false
    if (track.current) track.current.style.scrollSnapType = ''
  }

  const choose = (t: string) => {
    setFilter(t)
    track.current?.scrollTo({ left: 0 })
  }

  // Native <dialog>: focus trapping, Escape to close and focus restore
  // come built in.
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  const step = (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shown.length) % shown.length))
  const current = open !== null ? shown[open] : null

  return (
    <section id="results" aria-labelledby="results-title" className="relative isolate overflow-hidden rounded-[2.5rem] bg-ink">
      {/* Blurred practice photo (the treatment floor), pre-blurred at build
          time into a 6KB image rather than blurred live — no filter or
          backdrop-filter cost. Because it's already blurred, the glass
          panel below only needs translucent white to read as frosted. */}
      <img
        src={backdrop}
        alt=""
        aria-hidden="true"
        width={960}
        height={762}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/60" />

      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-28">
        <div ref={intro} className="text-center">
          <p className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.16em] text-bone/75 uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan" />
            Results
          </p>
          {/* Reveal keyed off the unclipped intro block (see ToothExplorer.tsx). */}
          <motion.h2
            id="results-title"
            initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
            animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
            transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
            // Big display headline — the section's centrepiece, sized up to
            // hero scale (client request). pb: the reveal's clip-path clips
            // to this box, and the script "f" descends below the tight line
            // height — without it the tail gets cut off flat.
            className="hero-copy-shadow mt-4 pb-[0.18em] font-display text-[clamp(3.25rem,10vw,9rem)] leading-[0.95] font-medium tracking-[-0.04em] text-bone"
          >
            Before &amp; <span className="font-script text-[1.12em] font-semibold tracking-normal">after</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={introInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.8, ease, delay: reduce ? 0 : 0.3 }}
            className="hero-copy-shadow mx-auto mt-1 max-w-md text-[15px] leading-relaxed text-bone/80"
          >
            Photos from our before &amp; after gallery. Select one to view it larger.
          </motion.p>
        </div>

        {/* Frosted glass panel holding the filters, arrows and cards. */}
        <div className="mt-10 rounded-[2rem] border border-white/35 bg-white/20 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-5 lg:mt-14 lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter by treatment"
              // Soft fade at the right edge on phones: pills scroll sideways,
              // and a hard cut mid-word ("Teeth Whit|") read as a glitch.
              className="-m-1 flex min-w-0 gap-2 overflow-x-auto p-1 pr-8 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] [scrollbar-width:none] sm:pr-1 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
            >
              {treatments.map((t) => {
                const selected = t === filter
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(t)}
                    className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
                      selected ? 'bg-ink text-bone' : 'bg-white text-ink hover:bg-bone'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous photos"
                className="grid size-11 place-items-center rounded-full border border-white/70 text-bone transition-colors duration-300 hover:bg-white hover:text-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 rotate-180">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next photos"
                className="grid size-11 place-items-center rounded-full bg-white text-ink transition-colors duration-300 hover:bg-ink hover:text-bone"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={track}
            {...dragScroll}
            onScroll={syncBar}
            // Native scrollbar hidden: phones and macOS only show it while
            // already scrolling. The custom bar below always shows position.
            className="mt-4 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] active:cursor-grabbing sm:mt-5 [&::-webkit-scrollbar]:hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((r, i) => (
                <motion.button
                  key={r.key}
                  data-card
                  type="button"
                  layout={!reduce}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease }}
                  onClick={() => !dragged.current && setOpen(i)}
                  aria-label={`View larger: ${r.label}`}
                  // 4 across on desktop, 3 on tablet, ~1.2 on phones.
                  // Focus outline drawn just inside the card's edge: the
                  // default one sits outside it, where this sideways-scrolling
                  // row clips it into broken blue slivers.
                  className="group flex w-[78%] shrink-0 snap-start flex-col rounded-[1.25rem] bg-[#f7f7f5] p-5 text-left text-ink transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-cyan sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
                >
                  <span className="font-display text-lg leading-tight font-medium">{treatmentOf(r.label)}</span>
                  <span className="mt-1 text-[13px] text-ink/55">{timeframeOf(r.label) ?? 'Before & after'}</span>

                  {/* After shot by default; the before shot fades in on hover/focus. */}
                  <span className="relative mx-auto my-7 block size-36 overflow-hidden rounded-full ring-1 ring-ink/10 sm:size-40">
                    <img
                      src={photoFor(r.key)}
                      alt=""
                      width={400}
                      height={600}
                      loading="lazy"
                      style={AFTER}
                      className="absolute left-1/2 w-auto max-w-none -translate-x-1/2 transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
                    />
                    <img
                      src={photoFor(r.key)}
                      alt=""
                      width={400}
                      height={600}
                      loading="lazy"
                      style={BEFORE}
                      className="absolute left-1/2 w-auto max-w-none -translate-x-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3 left-1/2 grid -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-bone uppercase"
                    >
                      <span className="col-start-1 row-start-1 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0">After</span>
                      <span className="col-start-1 row-start-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">Before</span>
                    </span>
                  </span>

                  <span className="mt-auto flex items-end justify-between gap-3">
                    <span>
                      <span className="block text-[13px] font-medium">View full photo</span>
                      <span className="mt-0.5 block text-[13px] text-ink/50 tabular-nums">
                        {String(i + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/25 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bone"
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5">
                        <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Custom scroll bar: always visible (unlike native scrollbars on
              phones/macOS). Drag the thumb, or press anywhere on the track to
              jump there. Positioned via refs on scroll — no re-renders. */}
          <div
            ref={bar}
            aria-hidden="true"
            onPointerDown={barDown}
            onPointerMove={barMove}
            onPointerUp={barUp}
            className="relative mt-4 h-5 cursor-pointer touch-none sm:mt-5"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
            <div ref={thumb} className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)]" />
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-bone/70">Individual results vary.</p>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        aria-label={current ? current.label : 'Result photo'}
        className="m-auto max-h-none max-w-none bg-transparent p-4 text-bone backdrop:bg-ink/95"
      >
        {current && (
          <div className="flex flex-col items-center">
            <img
              src={photoFor(current.key)}
              alt={current.label}
              width={400}
              height={600}
              className="max-h-[78vh] w-auto rounded-[1.25rem] ring-1 ring-white/10"
            />
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink p-1.5 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="grid size-9 place-items-center rounded-md border border-white/20 transition-colors hover:bg-bone hover:text-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 rotate-180">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <p className="min-w-[14rem] text-center text-sm text-bone/80">
                {current.label}
                <span className="ml-2 text-mute tabular-nums">
                  {open! + 1}/{shown.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="grid size-9 place-items-center rounded-md border border-white/20 transition-colors hover:bg-bone hover:text-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="ml-2 grid size-9 place-items-center rounded-md border border-white/20 transition-colors hover:bg-bone hover:text-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
