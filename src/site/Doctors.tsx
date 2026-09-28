import { useId, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { doctors } from '../data/content'
import drVuPhoto from '../assets/images/stephanie-vu.jpg'
import drRathiPhoto from '../assets/images/nukul-rathi.jpg'
import { Eyebrow } from './ui/Button'
import { Collapse } from './ui/Collapse'

const ease = [0.2, 0.7, 0.2, 1] as const

const photos: Record<string, string> = {
  vu: drVuPhoto,
  rathi: drRathiPhoto,
}

// Straight from the bios: Dr. Rathi is a visiting provider, not on staff
// full time — the card says so rather than presenting both the same way.
const role: Record<string, string> = {
  vu: 'Dentist',
  rathi: 'Visiting provider',
}

export default function Doctors() {
  const reduce = useReducedMotion() ?? false
  // Watched on the unclipped intro block — the heading starts fully
  // clipped, which never counts as "in view" (see ToothExplorer.tsx).
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })

  return (
    <section id="doctors" aria-labelledby="doctors-title" className="bg-ink">
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:py-28">
        <div ref={intro} className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>Our doctors</Eyebrow>
            <motion.h2
              id="doctors-title"
              initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
              animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
              transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
              className="mt-5 max-w-[16ch] font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] font-light tracking-[-0.02em] text-bone"
            >
              Meet our doctors
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={introInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.8, ease, delay: reduce ? 0 : 0.3 }}
            className="max-w-md text-[15px] leading-relaxed text-bone/60 lg:justify-self-end"
          >
            The doctors you trust with your smile.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {doctors.map((doctor, i) => (
            <DoctorCard key={doctor.key} doctor={doctor} index={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DoctorCard({ doctor, index, reduce }: { doctor: (typeof doctors)[number]; index: number; reduce: boolean }) {
  const [open, setOpen] = useState(false)
  const bioId = useId()
  const [lead, ...rest] = doctor.bio

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: reduce ? 0 : 0.7, ease, delay: reduce ? 0 : index * 0.12 }}
      // group + focus-within: keyboard users get the same colour reveal
      // when they tab onto the bio toggle.
      className="group"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-graphite ring-1 ring-line lg:aspect-square">
        <img
          src={photos[doctor.key]}
          alt={`Portrait of ${doctor.name}`}
          width={1400}
          height={788}
          loading="lazy"
          // Monochrome → colour only where hover exists; on touch screens the
          // portraits simply stay in colour instead of being stuck grey.
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition duration-700 ease-(--ease-out-soft) group-focus-within:scale-[1.06] group-focus-within:grayscale-0 group-hover:scale-[1.06] group-hover:grayscale-0 [@media(hover:hover)]:grayscale"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
        <p className="absolute top-5 left-5 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-medium tracking-[0.12em] text-bone/80 uppercase ring-1 ring-white/10">
          {role[doctor.key]}
        </p>
        <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
          <h3 className="font-display text-2xl font-medium text-bone sm:text-3xl">{doctor.name}</h3>
          <p className="mt-1 text-sm text-bone/70">{doctor.credentials}</p>
        </div>
      </div>

      <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-bone/75">{lead}</p>

      <Collapse open={open} id={bioId}>
        <div className="max-w-xl space-y-4 pt-4 text-[15px] leading-relaxed text-bone/60">
          {rest.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
      </Collapse>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bioId}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 px-4 text-[13px] font-medium text-bone transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.06]"
        >
          {open ? 'Show less' : 'Read full bio'}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`size-3.5 transition-transform duration-300 ease-(--ease-out-soft) ${open ? 'rotate-45' : ''}`}
          >
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.article>
  )
}
