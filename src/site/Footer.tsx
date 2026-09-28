import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import logo from '../assets/images/logo.png'
import { business, hours } from '../data/content'
import { sections } from './sections'
import { scrollToTop } from './ui/scrollToTop'

const ease = [0.2, 0.7, 0.2, 1] as const

// Real hours, with genuinely identical adjacent days merged (Tue/Wed) —
// no values invented, only the grouping is a display choice.
const hourGroups = hours.reduce<{ days: string[]; time: string }[]>((groups, h) => {
  const last = groups.at(-1)
  if (last && last.time === h.time && h.time !== 'Closed') last.days.push(h.day)
  else groups.push({ days: [h.day], time: h.time })
  return groups
}, [])
const dayLabel = (days: string[]) => (days.length === 1 ? days[0].slice(0, 3) : `${days[0].slice(0, 3)}–${days.at(-1)!.slice(0, 3)}`)

const year = new Date().getFullYear()

// Compact by design (client request): the whole footer fits one screen, on
// phones too — contact and hours sit side by side, and the section links
// wrap in a row instead of stacking in a tall column.
export default function Footer() {
  const reduce = useReducedMotion() ?? false

  return (
    <footer className="bg-ink p-2 sm:p-3">
      <div className="relative overflow-hidden rounded-[2rem] bg-cyan text-ink sm:rounded-[2.5rem]">
        <div className="mx-auto max-w-[1600px] px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
          {/* Brand + closing call to action. */}
          <div className="flex flex-col gap-5 border-b border-ink/15 pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
            <div className="flex items-center gap-4">
              <span className="inline-flex shrink-0 rounded-lg bg-ink px-2.5 py-1.5">
                <img src={logo} alt="Idea Dental" width={476} height={176} loading="lazy" className="h-6 w-auto" />
              </span>
              <p className="max-w-[26ch] font-display text-[15px] leading-snug sm:text-lg">Comprehensive dental care for you and your family.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="#contact"
                className="group inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13px] font-medium text-bone transition-colors duration-300 hover:bg-bone hover:text-ink"
              >
                Request an appointment
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </a>
              <a
                href={business.phoneHref}
                className="inline-flex h-10 items-center rounded-md border border-ink/30 px-4 text-[13px] font-medium transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cyan"
              >
                Call or text {business.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.45fr] gap-x-4 gap-y-6 py-6 sm:grid-cols-2 sm:gap-x-5 sm:py-8 lg:grid-cols-[1fr_1fr_1.4fr] lg:gap-10">
            <Column title="Visit & contact">
              <address className="text-[13px] leading-relaxed not-italic sm:text-[15px]">
                {business.address.line1}
                <br />
                {business.address.line2}
              </address>
              <p className="mt-2 flex flex-col gap-1 text-[13px] sm:text-[15px]">
                <FooterLink href={business.mapsUrl} external>
                  Get directions
                </FooterLink>
                <FooterLink href={business.phoneHref}>{business.phone}</FooterLink>
                <span className="text-ink/70">Hablamos Español</span>
              </p>
            </Column>

            <Column title="Hours">
              <dl className="space-y-1 text-[11px] min-[380px]:text-[12px] sm:text-[14px]">
                {hourGroups.map((g) => (
                  <div key={g.days.join()} className="flex justify-between gap-2 sm:gap-3">
                    <dt className="shrink-0">{dayLabel(g.days)}</dt>
                    <dd className={`text-right whitespace-nowrap tabular-nums ${g.time === 'Closed' ? 'text-ink/60' : ''}`}>{g.time}</dd>
                  </div>
                ))}
              </dl>
            </Column>

            <Column title="Explore" className="col-span-2 lg:col-span-1">
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <FooterLink href={`#${s.id}`}>{s.label}</FooterLink>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 flex gap-4">
                <li>
                  <FooterLink href={business.social.facebook} external>
                    Facebook
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href={business.social.yelp} external>
                    Yelp
                  </FooterLink>
                </li>
              </ul>
            </Column>
          </div>
        </div>

        {/* Wordmark, edge to edge but capped in height so the footer stays short. */}
        <motion.p
          aria-hidden="true"
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.9, ease }}
          className="px-3 pb-[0.04em] text-center font-display text-[min(16vw,11rem)] leading-[0.85] font-light tracking-[-0.06em] whitespace-nowrap text-ink select-none"
        >
          Idea Dental
        </motion.p>

        <div className="relative bg-ink/[0.06]">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-5 py-4 text-[11px] text-ink/70 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>
              © {year} {business.name}. All rights reserved.
            </p>
            {/* Required attribution for the Tooth explorer's 3D model (CC BY 4.0,
                public/models/molar-license.txt). Must stay somewhere on the
                site for as long as that model is used. */}
            <p className="lg:text-center">
              3D tooth model{' '}
              <a
                href="https://sketchfab.com/3d-models/maxillary-first-molar-with-two-root-canals-9481d0b5150b44f2bfbbb53b688cdf87"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                “Maxillary First Molar with Two Root Canals”
              </a>{' '}
              by University of Dundee, School of Dentistry,{' '}
              <a
                href="http://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                CC BY 4.0
              </a>
            </p>
            <a
              href="#top"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 font-medium text-ink hover:underline hover:underline-offset-4"
            >
              Back to top
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 -rotate-90 transition-transform group-hover:-translate-y-0.5">
                <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Column({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2.5 text-[10px] font-medium tracking-[0.16em] text-ink/60 uppercase sm:text-[11px]">{title}</p>
      {children}
    </div>
  )
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group inline-flex items-center gap-1 text-[13px] underline-offset-4 hover:underline sm:text-[15px]"
    >
      {children}
      {external && (
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  )
}
