import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { technology } from '../data/content'
import { Eyebrow } from './ui/Button'

const ease = [0.2, 0.7, 0.2, 1] as const

// Both are the manufacturers' own videos (the same ones the live site
// embeds), so each card says whose video it is rather than implying the
// footage was shot at the practice.
const videoSource: Record<string, string> = {
  cby3c8VHLgM: 'iTero',
  dyivqeElRVg: 'Acteon',
}

// Poster frame per video. The Piezotome video's default thumbnail is a
// bloody bone graphic captioned "immediate destruction & removal of bone" —
// the wrong first impression for anxious patients — so it uses YouTube's
// third auto-frame instead (a clean implant illustration, no blood).
const posterFrame: Record<string, string> = {
  cby3c8VHLgM: 'maxresdefault',
  dyivqeElRVg: 'maxres3',
}

export default function Technology() {
  const reduce = useReducedMotion() ?? false
  // Watched on the unclipped intro block — the heading starts fully
  // clipped, which never counts as "in view" (see ToothExplorer.tsx).
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })

  return (
    // Bottom half of one continuous light panel with the Tooth explorer above
    // (same paper colour, no seam): that section rounds the panel's top
    // corners, this one rounds the bottom. pt-0: the explorer's own bottom
    // padding already supplies the gap between them.
    <section id="technology" aria-labelledby="technology-title" className="relative z-10 rounded-b-[2.5rem] bg-paper text-ink">
      <div className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:pb-28">
        <div ref={intro} className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow tone="light">Our technology</Eyebrow>
            <motion.h2
              id="technology-title"
              initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
              animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
              transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
              className="mt-5 max-w-[16ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-ink"
            >
              The newest technology
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={introInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.8, ease, delay: reduce ? 0 : 0.3 }}
            className="max-w-md text-[15px] leading-relaxed text-ink/65 lg:justify-self-end"
          >
            Two of the tools we use in the practice. Press play to watch how each one works.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {technology.map((item, i) => (
            <VideoCard key={item.youtubeId} item={item} index={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoCard({ item, index, reduce }: { item: (typeof technology)[number]; index: number; reduce: boolean }) {
  // Click-to-load: nothing from YouTube's player (scripts, cookies, ~1MB of
  // JS) loads until the visitor actually asks for the video. Only the
  // thumbnail image is fetched up front, lazily.
  const [playing, setPlaying] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: reduce ? 0 : 0.7, ease, delay: reduce ? 0 : index * 0.12 }}
    >
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-ink shadow-[0_24px_60px_rgba(11,13,14,0.14)]">
        {playing ? (
          <iframe
            ref={frame}
            // Privacy-enhanced domain: no YouTube cookies unless they play.
            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={`${item.title} — video`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => frame.current?.focus()}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${item.title}`}
            className="group absolute inset-0 block h-full w-full text-left"
          >
            <img
              src={`https://i.ytimg.com/vi/${item.youtubeId}/${posterFrame[item.youtubeId] ?? 'maxresdefault'}.jpg`}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover grayscale-[40%] transition duration-700 ease-(--ease-out-soft) group-hover:scale-[1.04] group-hover:grayscale-0"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" />
            <span className="absolute top-5 left-5 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-medium tracking-[0.12em] text-bone/80 tabular-nums ring-1 ring-white/10">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="absolute inset-0 grid place-items-center">
              <span className="relative grid size-16 place-items-center rounded-full bg-cyan text-ink shadow-[0_12px_40px_rgba(0,169,221,0.35)] transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-110 sm:size-20">
                {!reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-cyan/30 [animation-duration:2.4s]" />}
                <svg aria-hidden="true" viewBox="0 0 16 16" className="relative ml-0.5 size-5 sm:size-6">
                  <path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" fill="currentColor" />
                </svg>
              </span>
            </span>          </button>
        )}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
        <h3 className="font-display text-xl font-medium text-ink sm:text-2xl">{item.title}</h3>
        <p className="text-[12px] text-ink/50 sm:text-right">Video: {videoSource[item.youtubeId]} on YouTube</p>
      </div>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/65">{item.description}</p>
    </motion.article>
  )
}
