import { motion, useReducedMotion } from 'framer-motion'
import iteroImg from '../../assets/images/services/itero-scanner.jpg'
import { business } from '../../data/content'
import { ButtonLink, Eyebrow } from '../ui/Button'

const videoSrc = `${import.meta.env.BASE_URL}video/dental-procedure.mp4`
const poster = `${import.meta.env.BASE_URL}video/poster.webp`

const ease = [0.2, 0.7, 0.2, 1] as const

// React sets `muted` only as a DOM property and never writes the attribute,
// and iOS Safari checks the attribute before allowing muted autoplay — so
// without this the hero video never starts on iPhones. Also re-tries play()
// whenever the page becomes visible again (browsers pause background video).
// If autoplay is still refused (e.g. Low Power Mode), the poster image stays.
function ensureAutoplay(video: HTMLVideoElement | null) {
  if (!video) return
  video.muted = true
  video.setAttribute('muted', '')
  const play = () => {
    if (document.visibilityState === 'visible') video.play().catch(() => {})
  }
  play()
  document.addEventListener('visibilitychange', play)
  return () => document.removeEventListener('visibilitychange', play)
}

// Full-bleed video hero: real footage from the practice's own live site
// (already public there — not stock, not staged for this redesign), shot
// bright/clinical rather than the near-black stage the earlier 3D-tooth
// version used. That brightness is why this version leans harder on the
// scrim stack below — a bright real photo needs more darkening than an
// already-dark 3D scene did to keep white text legible everywhere.
export default function Hero() {
  const reduce = useReducedMotion()

  // Static poster only for reduced motion or data-saver connections — never
  // autoplay a multi-MB video for either. Both are readable synchronously at
  // render time, so this is a plain derived value, not effect-driven state.
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  const canPlay = !reduce && !saveData

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.8, ease, delay: reduce ? 0 : delay },
  })

  // Headline only: a left-to-right wipe (clip-path) resolving from blurred
  // to sharp — this is what the reference actually does on its text, frame
  // by frame: both lines reveal in lockstep as one rectangle sweeping open,
  // not a per-word pop or a uniform whole-line fade.
  const headlineReveal = {
    initial: { clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' },
    animate: { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' },
    transition: { duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 },
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      // sticky + a lower stacking order than the section below it — that
      // section's solid, rounded-top panel rises up the page and covers
      // Hero like a curtain, while Hero itself stays put ("steady")
      // underneath until it's fully covered, then releases normally.
      className="sticky top-0 z-0 isolate min-h-[max(100svh,640px)] overflow-hidden bg-ink"
    >
      {/* Full-bleed visual: fades up from the section's own black on mount —
          the reference's opening beat (black → image), played once. A CSS
          animation, not a JS one: on a slow or throttled phone a JS-driven
          fade can sit at opacity 0 for seconds, leaving the hero black. */}
      <div aria-hidden="true" className="hero-fade-in absolute inset-0">
        {canPlay ? (
          <video
            ref={ensureAutoplay}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <img
            src={poster}
            alt=""
            width={1600}
            height={900}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Scrim stack — this footage is bright and clinical rather than a
          dark stage, so it needs real darkening (not just directional
          gradients) to keep white text legible wherever it lands: a flat
          tint across the whole frame, plus top (header), left (headline)
          and bottom (copy) gradients layered on top of that. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/40" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/65 from-0% via-transparent via-25% to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink from-[6%] via-ink/45 via-45% to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/85 from-[2%] via-ink/15 via-40% to-transparent lg:via-55%" />

      {/* Copy, anchored to the bottom edge and overlaid directly on the image. */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-4 pb-8 sm:px-6 lg:pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {/* Shadowed on its own — scrims alone can't guarantee contrast
                wherever the footage's brighter areas land behind this text
                at a given viewport. Buttons/card sit on their own solid
                backgrounds and don't need it. */}
            <div className="hero-copy-shadow">
              <motion.div {...rise(0.1)}>
                <Eyebrow>Idea Dental · Houston, Texas</Eyebrow>
              </motion.div>
              <motion.h1
                id="hero-title"
                {...headlineReveal}
                className="mt-4 max-w-[13ch] font-display text-[clamp(2.5rem,5.6vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-bone"
              >
                General dentistry in Houston, TX
              </motion.h1>
              <motion.p {...rise(0.32)} className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/70 sm:text-base">
                Comprehensive dental care for you and your family, from routine checkups to restorative and cosmetic
                treatments.
              </motion.p>
            </div>
            <motion.div {...rise(0.44)} className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="#contact" arrow>
                Request an appointment
              </ButtonLink>
              <ButtonLink href={business.phoneHref} variant="secondary">
                Call or text {business.phone}
              </ButtonLink>
            </motion.div>
            {/* One fact per line (client request). */}
            <motion.ul {...rise(0.54)} className="hero-copy-shadow mt-6 flex flex-col gap-1.5 text-[12px] text-bone/55">
              {['Hablamos Español', 'We accept all insurance plans', 'Walk-ins Tue & Wed · 10 AM – 6 PM'].map((fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-cyan" />
                  {fact}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Floating info card — in-flow under the copy on mobile, an
              absolutely positioned corner card over the image at lg:. */}
          <motion.a
            {...rise(0.4)}
            href="#technology"
            // No backdrop-blur — profiled cost, see Header.tsx's nav pills.
            className="group flex w-full max-w-sm items-center gap-4 rounded-[14px] bg-ink/82 p-2.5 pl-5 ring-1 ring-white/12 transition-colors duration-300 hover:bg-ink/92 lg:w-auto"
          >
            <span>
              <Eyebrow className="text-[10px]">Our technology</Eyebrow>
              <span className="mt-1.5 block max-w-52 text-sm leading-snug text-bone/85">
                iTero digital scanning — precise 3D imaging in place of traditional impressions.
              </span>
            </span>
            <img
              src={iteroImg}
              alt=""
              width={800}
              height={596}
              loading="lazy"
              className="h-16 w-20 shrink-0 rounded-[9px] object-cover grayscale transition duration-500 group-hover:grayscale-0"
            />
          </motion.a>
        </div>
      </div>
    </section>
  )
}
