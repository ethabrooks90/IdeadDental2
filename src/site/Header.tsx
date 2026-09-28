import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logo from '../assets/images/logo.png'
import { business, hours } from '../data/content'
import { headerNav, sections } from './sections'
import { ButtonLink } from './ui/Button'
import { scrollToTop } from './ui/scrollToTop'

// Segmented bar adapted from the reference: logo tile, equal-width nav
// segments, one accent CTA. Below xl the segments collapse into a
// full-screen cyan menu (the reference's big brand-colour block).
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    menuButton.current?.focus()
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          scrolled ? 'bg-ink/70 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <a
          href="#main"
          className="sr-only rounded-md bg-cyan px-4 py-2 text-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-1.5 px-4 sm:px-6">
          <a
            href="#top"
            onClick={scrollToTop}
            className="flex h-8 shrink-0 items-center rounded-md bg-white/[0.04] px-3 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]"
          >
            <img src={logo} alt="Idea Dental — home" width={476} height={176} className="h-6 w-auto" />
          </a>

          <nav aria-label="Primary" className="hidden flex-1 gap-1.5 xl:flex">
            {headerNav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                // No backdrop-blur here — profiled at ~30% of the page's
                // first-load main-thread freeze across 5 repeated instances
                // (backdrop-filter is one of the most expensive things to
                // composite, worse still under software-rendered WebGL).
                // A touch more background opacity keeps the tinted-glass
                // read without the real-time blur sampling. Hover inverts
                // to a solid white tile (dark text, ring drops out) rather
                // than just nudging the tint, for a clearer hover state.
                className="group flex h-8 flex-1 items-center justify-between rounded-md bg-white/[0.055] px-4 text-[13px] text-bone/75 ring-1 ring-white/[0.08] transition-colors duration-300 hover:bg-bone hover:text-ink hover:ring-bone"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-cyan"
                />
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
            <ButtonLink
              href={business.phoneHref}
              variant="secondary"
              size="bar"
              className="max-sm:hidden"
              aria-label={`Call or text ${business.phone}`}
            >
              {business.phone}
            </ButtonLink>
            <ButtonLink href="#contact" size="bar" className="max-md:hidden">
              Request appointment
            </ButtonLink>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex h-8 items-center gap-2 rounded-md bg-white/[0.04] px-4 text-[13px] text-bone ring-1 ring-white/10 transition-colors hover:bg-white/[0.09]"
            >
              Menu
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
                <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>{open && <MenuOverlay onClose={closeMenu} />}</AnimatePresence>
    </>
  )
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Keep Tab inside the dialog while it's open.
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>('a, button')
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const t = { duration: reduce ? 0 : 0.5, ease: [0.2, 0.7, 0.2, 1] as const }

  return (
    <motion.div
      id="site-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-2 z-50 flex flex-col overflow-y-auto rounded-[20px] bg-cyan p-5 text-ink sm:inset-3 sm:rounded-[28px] sm:p-8"
      initial={{ clipPath: 'inset(0 0 100% 0 round 28px)' }}
      animate={{ clipPath: 'inset(0 0 0% 0 round 28px)' }}
      exit={{ clipPath: 'inset(0 0 100% 0 round 28px)' }}
      transition={t}
    >
      <div className="flex items-start justify-between gap-6">
        <p className="max-w-xs text-sm leading-relaxed text-ink/75">
          Questions about a visit? Call or text us at{' '}
          <a href={business.phoneHref} className="font-medium text-ink underline underline-offset-4">
            {business.phone}
          </a>
          . Hablamos Español.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-ink px-4 text-[13px] text-bone focus-visible:outline-ink"
        >
          Close
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <div className="mt-10 grid flex-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="order-2 flex flex-col justify-end gap-6 text-sm text-ink/80 lg:order-1">
          <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            {hours.map((h) => (
              <div key={h.day} className="contents">
                <dt className="text-ink/70">{h.day}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
          <address className="not-italic">
            {business.address.line1}
            <br />
            {business.address.line2}
          </address>
        </div>

        <nav aria-label="Site sections" className="order-1 lg:order-2">
          <ul className="border-t border-ink/20">
            {sections.map((s, i) => (
              <motion.li
                key={s.id}
                className="border-b border-ink/20"
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...t, delay: reduce ? 0 : 0.15 + i * 0.03 }}
              >
                <a
                  href={`#${s.id}`}
                  onClick={onClose}
                  className="group flex items-baseline justify-between py-2 font-display text-3xl font-light tracking-tight text-ink/70 transition-colors hover:text-ink focus-visible:outline-ink sm:text-[2.6rem]"
                >
                  {s.label}
                  <span className="font-sans text-xs tracking-normal text-ink/50 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.div>
  )
}
