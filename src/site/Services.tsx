import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { serviceCategories } from '../data/content'
import generalImg from '../assets/images/services/general-dentistry.jpg'
import restorativeImg from '../assets/images/services/dental-implants.jpg'
import cosmeticImg from '../assets/images/services/cosmetic-dentistry.jpg'
import orthodonticImg from '../assets/images/services/orthodontics.jpg'
import teethWhiteningImg from '../assets/images/services/teeth-whitening.jpg'
import rootCanalsImg from '../assets/images/services/root-canals.jpg'
import veneersImg from '../assets/images/services/veneers.jpg'
import denturesImg from '../assets/images/services/dentures.jpg'
import traditionalBracesImg from '../assets/images/services/traditional-braces.jpg'
import clearBracesImg from '../assets/images/services/clear-braces.jpg'
import bracesForTeensImg from '../assets/images/services/braces-for-teens.jpg'
import invisalignImg from '../assets/images/services/invisalign.jpg'
import invisalignForTeensImg from '../assets/images/services/invisalign-for-teens.jpg'
import retentionImg from '../assets/images/services/retention.jpg'
import iteroScannerImg from '../assets/images/services/itero-scanner.jpg'
import earlyTreatmentImg from '../assets/images/services/early-treatment.jpg'
import adultTreatmentImg from '../assets/images/services/adult-treatment.jpg'
import { ButtonLink, Eyebrow } from './ui/Button'
import { Collapse } from './ui/Collapse'

const categoryImages = {
  general: generalImg,
  restorative: restorativeImg,
  cosmetic: cosmeticImg,
  orthodontic: orthodonticImg,
} as const

// Every treatment tag gets its own real photo where the live site has one —
// no invented photography.
const treatmentImages: Partial<Record<string, string>> = {
  'Teeth Whitening': teethWhiteningImg,
  'Root Canals': rootCanalsImg,
  Veneers: veneersImg,
  Dentures: denturesImg,
  'Dental Implants': restorativeImg,
  'Traditional Braces': traditionalBracesImg,
  'Clear Braces': clearBracesImg,
  'Braces for Teens': bracesForTeensImg,
  Invisalign: invisalignImg,
  'Invisalign for Teens': invisalignForTeensImg,
  Retention: retentionImg,
  'iTero Intraoral Scanner': iteroScannerImg,
  'Early Treatment': earlyTreatmentImg,
  'Adult Treatment': adultTreatmentImg,
}

// A scroll-scrubbed sequence rather than one playing video — every frame of
// the walkthrough (storefront → reception → office → treatment room), all
// 160, so the scrub reads as continuous motion rather than stepped stills.
const frameNumbers = Array.from({ length: 160 }, (_, i) => i + 1)

const ease = [0.2, 0.7, 0.2, 1] as const

// Track height in svh: 100 of it is the stage itself, the first 100 of
// scroll is About uncovering it, the remaining 250 is the scrub.
const TRACK_SVH = 450
const REVEAL_SHARE = 100 / (TRACK_SVH - 100)
const tourFrames = frameNumbers.map((n) => {
  const padded = String(n).padStart(3, '0')
  return `${import.meta.env.BASE_URL}video/services-frames/frame-${padded}.webp`
})

// Dot-matrix icons (9×9 bitmaps, X = dot) — the reference's pixel-grid
// icon style. Each dot is its own circle so it can light up individually.
const dotIcons = {
  general: [
    '.XX...XX.',
    'XXXX.XXXX',
    'XXXXXXXXX',
    'XXXXXXXXX',
    '.XXXXXXX.',
    '.XXX.XXX.',
    '.XX...XX.',
    '.XX...XX.',
    '..X...X..',
  ],
  restorative: [
    '.XXXXXXX.',
    'XXXXXXXXX',
    '.XXXXXXX.',
    '...XXX...',
    '..XXXXX..',
    '...XXX...',
    '..XXXXX..',
    '...XXX...',
    '....X....',
  ],
  cosmetic: [
    '....X....',
    '....X....',
    '...XXX...',
    '..XXXXX..',
    'XXXXXXXXX',
    '..XXXXX..',
    '...XXX...',
    '....X....',
    '....X....',
  ],
  orthodontic: [
    '.........',
    '.........',
    'X.......X',
    '.X.....X.',
    '.XXXXXXX.',
    '..X.X.X..',
    '...XXX...',
    '.........',
    '.........',
  ],
} as const

// On hover the dots switch on one by one — a diagonal sweep with a little
// scrambled jitter, like the reference's icons assembling — rather than all
// at once. Resting dots sit dim; active (expanded) rows stay fully lit.
function DotIcon({ rows, lit }: { rows: readonly string[]; lit: boolean }) {
  const dots = rows.flatMap((row, r) =>
    [...row].flatMap((cell, c) => (cell === 'X' ? [{ r, c, delay: (r + c) * 14 + ((r * 7 + c * 13) % 5) * 22 }] : [])),
  )
  return (
    <svg aria-hidden="true" viewBox="0 0 9 9" className="size-[26px]">
      {dots.map(({ r, c, delay }) => (
        <circle
          key={`${r}-${c}`}
          cx={c + 0.5}
          cy={r + 0.5}
          r={0.36}
          fill="currentColor"
          style={{ transitionDelay: `${delay}ms` }}
          className={`transition-opacity duration-150 ${lit ? 'opacity-100' : 'opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
        />
      ))}
    </svg>
  )
}

// Short, real treatment list for the hover hint — the full list is in the
// expanded panel, so long lists are trimmed to two plus a count.
function treatmentHint(treatments: readonly string[]) {
  return treatments.length <= 3 ? treatments.join(' · ') : `${treatments.slice(0, 2).join(' · ')} +${treatments.length - 2} more`
}

function ServiceRow({
  category,
  index,
  active,
  onToggle,
}: {
  category: (typeof serviceCategories)[number]
  index: number
  active: boolean
  onToggle: () => void
}) {
  const dots = dotIcons[category.key as keyof typeof dotIcons]
  const panelId = useId()
  // Masked line motion shared by the title roll and the hint below.
  const roll = 'transition-transform duration-500 ease-(--ease-out-soft)'

  // Cursor-following photo preview — mouse only (touch has no hover; a tap
  // just opens the row), and never on the open row, whose panel already
  // shows this photo.
  const reduce = useReducedMotion()
  const [hovering, setHovering] = useState(false)
  // Flips to the cursor's left near the right edge, so it never overhangs
  // the page (that would add a horizontal scrollbar).
  const [flip, setFlip] = useState(false)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 260, damping: 26, mass: 0.6 })
  const springY = useSpring(pointerY, { stiffness: 260, damping: 26, mass: 0.6 })
  const track = (e: PointerEvent<HTMLButtonElement>, jump = false) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    pointerX.set(x)
    pointerY.set(y)
    // Preview width (w-44 below sm, w-60 from sm) + its 32px gap from the cursor.
    const previewWidth = window.innerWidth < 640 ? 176 : 240
    const nextFlip = x > box.width - (previewWidth + 32)
    if (nextFlip !== flip) setFlip(nextFlip)
    // Start where the cursor entered instead of flying in from the corner.
    if (jump) {
      springX.jump(x)
      springY.jump(y)
    }
  }

  return (
    <div id={`service-${category.key}`} className="relative border-b border-line first:border-t">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        aria-controls={panelId}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          track(e, true)
          setHovering(true)
        }}
        onPointerMove={(e) => e.pointerType === 'mouse' && track(e)}
        onPointerLeave={() => setHovering(false)}
        // isolate: the cyan hover fill below sits behind the row's content
        // (-z-10) without dropping behind the page. Ink focus outline, since
        // the default cyan one would vanish against the cyan fill.
        className="group relative isolate flex w-full items-center gap-4 py-5 text-left focus-visible:outline-ink sm:gap-6"
      >
        {/* Brand-cyan fill that sweeps up from the bottom on hover/focus. It
            bleeds a little past the content into the side gutter so the
            number/title stay aligned with the rest of the page. Everything
            in the row flips to dark ink while it's showing. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -inset-x-3 -z-10 origin-bottom scale-y-0 rounded-xl bg-cyan transition-transform duration-400 ease-(--ease-out-soft) group-hover:scale-y-100 group-focus-visible:scale-y-100 sm:-inset-x-4"
        />
        <span className="w-6 shrink-0 text-[13px] text-mute tabular-nums transition-colors duration-300 group-hover:text-ink/70 group-focus-visible:text-ink/70">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 group-hover:bg-ink group-hover:text-cyan group-hover:ring-ink group-focus-visible:bg-ink group-focus-visible:text-cyan group-focus-visible:ring-ink ${
            active ? 'bg-cyan text-ink ring-cyan' : 'bg-graphite text-bone ring-white/15'
          }`}
        >
          <DotIcon rows={dots} lit={active} />
        </span>
        {/* Title roll: the label slides up out of a mask while a bright copy
            rises in from below it — the reference's masked line reveal. */}
        <span className="relative min-w-0 flex-1 overflow-hidden font-display text-lg leading-8 font-medium sm:text-xl">
          <span
            className={`block truncate ${roll} ${
              active
                ? 'text-bone group-hover:text-ink group-focus-visible:text-ink'
                : 'text-bone/70 group-hover:-translate-y-full group-focus-visible:-translate-y-full'
            }`}
          >
            {category.label}
          </span>
          {!active && (
            <span
              aria-hidden="true"
              className={`absolute inset-0 block translate-y-full truncate text-ink ${roll} group-hover:translate-y-0 group-focus-visible:translate-y-0`}
            >
              {category.label}
            </span>
          )}
        </span>
        {/* Treatment hint rises from its own mask on wide screens, a beat
            after the title; hidden once the row is open (the panel lists them). */}
        {!active && (
          <span className="hidden shrink-0 overflow-hidden text-[13px] leading-6 text-ink/70 lg:block">
            <span
              className={`block translate-y-full opacity-0 transition-[translate,opacity] delay-75 duration-500 ease-(--ease-out-soft) group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
            >
              {treatmentHint(category.treatments)}
            </span>
          </span>
        )}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`size-4 shrink-0 text-mute transition-[rotate,color] duration-300 ease-(--ease-out-soft) group-hover:text-ink group-focus-visible:text-ink ${active ? 'rotate-45' : ''}`}
        >
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {/* Anchored at the cursor, offset up-right of it so it never sits
          under the pointer; pops in with a small scale + tilt. */}
      <motion.div
        aria-hidden="true"
        style={{ x: reduce ? pointerX : springX, y: reduce ? pointerY : springY }}
        // w-0: only the photo inside (translated to the cursor's side) takes
        // up space — a full-width wrapper here stuck out past the right edge
        // near the edge and caused sideways scrolling.
        className="pointer-events-none absolute top-0 left-0 z-20 w-0"
      >
        <AnimatePresence>
          {hovering && !active && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.75, rotate: 4 }}
              transition={{ duration: reduce ? 0 : 0.35, ease }}
              // Fixed width matching the photo, flipped with a translate: the
              // old negative-margin flip stretched this frame wider than the
              // photo, leaving an empty see-through strip beside it.
              className={`w-44 -translate-y-1/2 overflow-hidden rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:w-60 ${
                flip ? '-translate-x-[calc(100%+2rem)] origin-bottom-right' : 'translate-x-8 origin-bottom-left'
              }`}
            >
              <img
                src={categoryImages[category.key as keyof typeof categoryImages]}
                alt=""
                width={400}
                height={300}
                className="block aspect-[4/3] w-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Collapse open={active} id={panelId}>
        <div className="grid gap-6 pb-8 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:pl-16">
          {/* self-start: a stretched grid cell made this box taller than the
              photo, so its rounded bottom corners fell below the image. */}
          <div className="hidden self-start overflow-hidden rounded-[14px] sm:block">
            <img
              src={categoryImages[category.key as keyof typeof categoryImages]}
              alt=""
              width={400}
              height={300}
              loading="lazy"
              className="h-32 w-full object-cover grayscale-[35%]"
            />
          </div>

          <div className="min-w-0">
            <p className="max-w-lg text-[14px] leading-relaxed text-bone/60">{category.description}</p>

            <ul className="mt-4 flex max-w-xl flex-wrap gap-2">
              {category.treatments.map((treatment) => {
                const img = treatmentImages[treatment]
                return (
                  <li
                    key={treatment}
                    className={`flex items-center gap-1.5 rounded-full border border-line bg-graphite text-[12px] text-bone/70 ${
                      img ? 'py-1 pr-3 pl-1' : 'px-3 py-1'
                    }`}
                  >
                    {img && (
                      <img src={img} alt="" width={40} height={40} loading="lazy" className="size-5 rounded-full object-cover" />
                    )}
                    {treatment}
                  </li>
                )
              })}
            </ul>

            <ButtonLink href="#contact" size="sm" className="mt-5" arrow>
              Request an appointment
            </ButtonLink>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default function Services() {
  const [active, setActive] = useState(0)

  // #service-<key> links (e.g. from the Tooth explorer) open that row; the
  // browser's own anchor jump already scrolls to it.
  useEffect(() => {
    const openFromHash = () => {
      const key = window.location.hash.match(/^#service-(\w+)$/)?.[1]
      const i = serviceCategories.findIndex((c) => c.key === key)
      if (i >= 0) setActive(i)
    }
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])
  const banner = useRef<HTMLDivElement>(null)
  const [activeFrame, setActiveFrame] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const reduce = useReducedMotion()

  // Tracks the tall (non-sticky) track, not the pinned stage inside it — a
  // sticky element's own rect freezes while stuck, which would stall this.
  // The first REVEAL_SHARE of the track is About sliding up off the pinned
  // stage; frames hold on #1 until that's done, then scrub over the rest.
  // Curtain: the light Tooth explorer / Technology panel right after this
  // section rises up over it while it stays put (App.tsx wraps the three in
  // one container to bound the range). Real CSS sticky, pinned at its own
  // BOTTOM: top = viewport height − section height, so it sticks the moment
  // its bottom reaches the viewport's bottom. The browser does the pinning
  // during scroll (no per-frame JS, so no jitter); JS only re-measures when
  // the height actually changes — rows opening/closing, or a resize.
  const sectionRef = useRef<HTMLElement>(null)
  const [stickyTop, setStickyTop] = useState(0)
  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const measure = () => setStickyTop(window.innerHeight - el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: banner, offset: ['start start', 'end end'] })
  useEffect(() => {
    const sync = (v: number) => {
      const p = (v - REVEAL_SHARE) / (1 - REVEAL_SHARE)
      setActiveFrame(Math.min(tourFrames.length - 1, Math.max(0, Math.floor(p * tourFrames.length))))
      // The copy sits under About until it's uncovered, so a whileInView
      // entrance would fire unseen. Play it once About's edge has cleared
      // the heading; re-arm once it's covered again so it replays.
      if (v >= REVEAL_SHARE * 0.75) setRevealed(true)
      else if (v < REVEAL_SHARE * 0.3) setRevealed(false)
    }
    // Also sync once after mount: landing directly on #services (or a
    // restored scroll position) fires no change event on its own.
    const raf = requestAnimationFrame(() => sync(scrollYProgress.get()))
    const unsub = scrollYProgress.on('change', sync)
    return () => {
      cancelAnimationFrame(raf)
      unsub()
    }
  }, [scrollYProgress])

  // Same entrance as the Hero headline: a left-to-right clip-path wipe
  // resolving from blurred to sharp, with the eyebrow/paragraph rising in.
  // Hiding again (on re-arm) is instant — it's covered by About by then.
  const hiddenHeadline = { clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }
  const headlineReveal = {
    initial: hiddenHeadline,
    animate: revealed ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : hiddenHeadline,
    transition: revealed && !reduce ? { duration: 1, ease, delay: 0.15 } : { duration: 0 },
  }
  const rise = (delay: number) => {
    const hidden = { opacity: 0, y: reduce ? 0 : 18 }
    return {
      initial: hidden,
      animate: revealed ? { opacity: 1, y: 0 } : hidden,
      transition: revealed && !reduce ? { duration: 0.8, ease, delay } : { duration: 0 },
    }
  }
  // Function form on purpose: the range form gets hardware-accelerated into
  // a native scroll timeline that drops back to opacity 1 once the track
  // has scrolled past its end, so the copy reappeared after release.
  const copyOpacity = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (0.97 - v) / 0.11)))

  // Warm the browser's cache for all of these frames once the banner is
  // getting close, rather than fetching them one at a time as the scrub
  // reaches each one (which would show blank/loading frames mid-scroll) or
  // eagerly on initial page load (which would compete with the Hero/
  // above-the-fold requests for no benefit — the user hasn't scrolled
  // anywhere near here yet).
  useEffect(() => {
    const el = banner.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        for (const src of tourFrames) {
          const img = new window.Image()
          img.src = src
        }
        io.disconnect()
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    // Negative scroll-margin: the section's top is tucked a full screen up
    // under About, so #services links land where the stage is fully
    // uncovered instead of on About.
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-title"
      style={{ top: stickyTop }}
      className="sticky z-0 scroll-mt-[-100svh] bg-ink"
    >
      {/* Tall track pulled up a full screen under About (-mt), with a
          full-screen stage pinned inside it. About (z-10) scrolls up off the
          already-pinned stage, uncovering it; the stage then holds while
          scrolling scrubs through all 160 walkthrough frames, and releases
          into the service list. A single <img> whose src tracks the active
          frame — not 160 stacked DOM nodes. */}
      {/* Pulled up one corner-radius (2.5rem) short of a full screen, so the
          stage never reaches up into About's rounded top-corner cut-outs —
          it would paint over Hero there and show as black blocks. */}
      <div ref={banner} className="relative -mt-[calc(100svh-2.5rem)]" style={{ height: `${TRACK_SVH}svh` }}>
        <div className="sticky top-0 isolate h-svh overflow-hidden">
          <img
            src={tourFrames[activeFrame]}
            alt=""
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/45" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink from-[4%] via-ink/40 via-45% to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 from-0% via-ink/10 via-35% to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 from-0% via-transparent via-45% to-transparent" />

          {/* Headline pinned top-left, paragraph bottom-left, both held for
              the whole scrub and fading out just before the stage releases. */}
          <motion.div
            style={{ opacity: copyOpacity }}
            className="hero-copy-shadow absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-between px-4 pt-28 pb-10 sm:px-6 lg:pt-32 lg:pb-14"
          >
            <div>
              <motion.div {...rise(0.1)}>
                <Eyebrow>What we offer</Eyebrow>
              </motion.div>
              <motion.h2
                id="services-title"
                {...headlineReveal}
                className="mt-5 max-w-[20ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-bone"
              >
                General, restorative, cosmetic and orthodontic care
              </motion.h2>
            </div>
            <motion.p {...rise(0.32)} className="max-w-md text-[15px] leading-relaxed text-bone/70">
              From routine checkups to specialized treatment plans, our team provides care across four
              areas so your whole family's needs are met under one roof.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:pb-32">
        <div>
          {serviceCategories.map((category, i) => (
            <ServiceRow key={category.key} category={category} index={i} active={active === i} onToggle={() => setActive(active === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
