import { useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { business, hours } from '../data/content'
import { ButtonLink, Eyebrow } from './ui/Button'

const ease = [0.2, 0.7, 0.2, 1] as const

// The live site's form posts to its WordPress backend; this static site has
// none. Until the practice picks a form service (e.g. Formspree — paste its
// endpoint URL here), a request isn't "sent" anywhere pretend-silently:
// it's turned into a ready-to-send text message to the office instead,
// which the live site already invites ("Call or Text").
const FORM_ENDPOINT: string | null = null

const TIMES = ['Morning', 'Afternoon', 'Evening'] as const

const smsHref = (body: string) => `sms:${business.phoneHref.replace('tel:', '')}?&body=${encodeURIComponent(body)}`

type Fields = { name: string; phone: string; email: string; date: string; time: string; visit: string }
const empty: Fields = { name: '', phone: '', email: '', date: '', time: '', visit: '' }

const weekdayOf = (iso: string) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) : '')
const prettyDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

export default function Contact() {
  const reduce = useReducedMotion() ?? false
  const intro = useRef<HTMLDivElement>(null)
  const introInView = useInView(intro, { once: true, margin: '-80px' })

  const [fields, setFields] = useState<Fields>(empty)
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'compose' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const set = (k: keyof Fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }))

  // Real opening hours drive the date hint: closed days are an error, and
  // days with limited hours (e.g. Monday = surgeries only) show that note.
  const pickedDay = weekdayOf(fields.date)
  const dayHours = hours.find((h) => h.day === pickedDay)
  // Saturdays: open only the 2nd and 4th Saturday of each month.
  const offSaturday = pickedDay === 'Saturday' && ![2, 4].includes(Math.ceil(new Date(`${fields.date}T12:00:00`).getDate() / 7))
  const dateClosed = dayHours?.time === 'Closed' || offSaturday
  // Local date (en-CA formats as YYYY-MM-DD) — toISOString would be UTC and
  // could make "today" unselectable in the evening.
  const minDate = new Date().toLocaleDateString('en-CA')

  const errors = {
    name: !fields.name.trim() ? 'Please enter your name.' : '',
    phone: fields.phone.replace(/\D/g, '').length < 10 ? 'Please enter a phone number we can call.' : '',
    email: !/^\S+@\S+\.\S+$/.test(fields.email) ? 'Please enter a valid email address.' : '',
    date: !fields.date
      ? 'Please choose a preferred date.'
      : offSaturday
        ? "We're only open the 2nd and 4th Saturday of each month — please pick another day."
        : dateClosed
          ? `We're closed on ${pickedDay}s — please pick another day.`
          : '',
  }
  const valid = !Object.values(errors).some(Boolean)

  const message = [
    'Appointment request',
    `Name: ${fields.name.trim()}`,
    `Phone: ${fields.phone.trim()}`,
    `Email: ${fields.email.trim()}`,
    fields.date && `Preferred date: ${prettyDate(fields.date)}`,
    fields.time && `Preferred time: ${fields.time}`,
    fields.visit.trim() && `Nature of visit: ${fields.visit.trim()}`,
  ]
    .filter(Boolean)
    .join('\n')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    if (!FORM_ENDPOINT) {
      setStatus('compose')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, message }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${message}\n\nTo: ${business.phone}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const reset = () => {
    setFields(empty)
    setTouched(false)
    setStatus('idle')
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-ink">
      {/* Three blocks placed on a grid: phones read heading → form → contact
          details, so the main action isn't buried under the hours table;
          desktop puts heading + details on the left and the form on the right. */}
      {/* Compact by design (client request): fits one screen on laptops and
          desktops, with every detail kept — all fields, the notice, phone,
          address, directions and each day's hours with its note. */}
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-x-12 lg:gap-y-8 lg:py-16">
        <div ref={intro} className="lg:col-start-1 lg:row-start-1 lg:self-center">
          <Eyebrow>Contact</Eyebrow>
          {/* Reveal keyed off the unclipped intro block (see ToothExplorer.tsx). */}
          <motion.h2
            id="contact-title"
            initial={{ clipPath: 'inset(0 100% 0 0)', filter: reduce ? 'blur(0px)' : 'blur(8px)' }}
            animate={introInView ? { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)' } : undefined}
            transition={{ duration: reduce ? 0 : 1, ease, delay: reduce ? 0 : 0.15 }}
            className="mt-4 pb-[0.08em] font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.04] font-light tracking-[-0.03em] text-bone"
          >
            Request an <span className="text-cyan">appointment</span>
          </motion.h2>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-bone/60">
            Complete the form to request an appointment. Availability will vary depending on your request, and your appointment will be
            confirmed by phone by a member of our staff.
          </p>

          {/* Just the quick alternative to the form. Address, directions and
              the full opening hours live in the footer right below — shown
              here too they were a duplicate (client request). */}
          <div className="mt-8">
            <p className="text-[11px] font-medium tracking-[0.16em] text-mute uppercase">Prefer to talk?</p>
            <a href={business.phoneHref} className="mt-1.5 inline-block font-display text-2xl text-bone transition-colors hover:text-cyan">
              {business.phone}
            </a>
            <p className="mt-1 text-[13px] text-mute">Call or text · Hablamos Español</p>
          </div>
        </div>

        <div className="lg:col-start-2 lg:row-start-1 lg:self-center">
          <div className="rounded-[1.5rem] border border-line bg-graphite/60 p-4 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'compose' || status === 'sent' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease }}
                  role="status"
                >
                  {status === 'sent' ? (
                    <>
                      <h3 className="font-display text-2xl text-bone">Request sent — thank you!</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-bone/65">
                        A member of our staff will call you at {fields.phone.trim()} to confirm your appointment.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-2xl text-bone">Almost done — send it to us</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-bone/65">
                        Your request is ready. Send it to us as a text message, or call us and we'll book it with you. A member of our staff will
                        confirm by phone.
                      </p>
                      <pre className="mt-6 overflow-x-auto rounded-xl bg-ink/70 p-4 font-sans text-[13px] leading-relaxed whitespace-pre-wrap text-bone/80 ring-1 ring-line">
                        {message}
                      </pre>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <ButtonLink href={smsHref(message)} arrow>
                          Send as text
                        </ButtonLink>
                        <ButtonLink href={business.phoneHref} variant="secondary">
                          Call {business.phone}
                        </ButtonLink>
                        <button
                          type="button"
                          onClick={copy}
                          className="h-11 rounded-md px-4 text-sm font-medium text-bone/70 transition-colors hover:text-bone"
                        >
                          {copied ? 'Copied ✓' : 'Copy message'}
                        </button>
                      </div>
                    </>
                  )}
                  <button type="button" onClick={reset} className="mt-8 text-[13px] text-mute underline underline-offset-4 hover:text-bone">
                    Start a new request
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                  aria-describedby="contact-notice"
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-x-4">
                    <Field label="Name" required value={fields.name} onChange={set('name')} error={touched ? errors.name : ''} autoComplete="name" />
                    <Field
                      label="Phone"
                      required
                      type="tel"
                      value={fields.phone}
                      onChange={set('phone')}
                      error={touched ? errors.phone : ''}
                      autoComplete="tel"
                    />
                    <Field
                      label="Email"
                      required
                      type="email"
                      value={fields.email}
                      onChange={set('email')}
                      error={touched ? errors.email : ''}
                      autoComplete="email"
                      className="col-span-2"
                    />
                    <Field
                      label="Preferred date"
                      required
                      type="date"
                      min={minDate}
                      value={fields.date}
                      onChange={set('date')}
                      error={touched || dateClosed ? errors.date : ''}
                      hint={!dateClosed && dayHours ? `${dayHours.day}: ${dayHours.time}${dayHours.note ? ` · ${dayHours.note}` : ''}` : ''}
                      className="col-span-2 sm:col-span-1"
                    />
                    <fieldset className="col-span-2 sm:col-span-1">
                      <legend className="text-[13px] text-bone/75">Preferred time</legend>
                      <div className="mt-1.5 flex gap-2">
                        {TIMES.map((t) => {
                          const on = fields.time === t
                          return (
                            <label
                              key={t}
                              className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-md text-[13px] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-cyan ${
                                on ? 'bg-bone text-ink' : 'bg-white/[0.04] text-bone/70 ring-1 ring-white/12 hover:text-bone'
                              }`}
                            >
                              <input
                                type="radio"
                                name="time"
                                value={t}
                                checked={on}
                                onChange={() => set('time')(t)}
                                onClick={() => on && set('time')('')}
                                className="sr-only"
                              />
                              {t}
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>
                    <Field
                      label="Nature of visit"
                      value={fields.visit}
                      onChange={set('visit')}
                      placeholder="e.g. cleaning, braces consultation"
                      className="col-span-2"
                    />
                  </div>

                  {/* The live site's own notice, kept word for word in meaning. */}
                  <p id="contact-notice" className="mt-4 rounded-xl bg-white/[0.03] p-3 text-[12px] leading-relaxed text-bone/60 ring-1 ring-line">
                    Please use this form for general information only. <strong className="font-medium text-bone/85">Do not send personal health information</strong>{' '}
                    through this form — specific patient care will be addressed during your appointment.
                  </p>

                  {status === 'error' && (
                    <p role="alert" className="mt-4 text-[13px] text-red">
                      Something went wrong sending your request. Please call or text us at {business.phone}.
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="group inline-flex h-11 items-center gap-2.5 rounded-md bg-cyan px-6 text-sm font-medium text-ink transition-colors duration-300 hover:bg-bone disabled:opacity-60"
                    >
                      {status === 'sending' ? 'Sending…' : 'Request appointment'}
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5">
                        <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </button>
                    <p className="text-[12px] text-mute">* Required</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  )
}


function Field({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className = '',
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  required?: boolean
  className?: string
  type?: string
  min?: string
  placeholder?: string
  autoComplete?: string
}) {
  const id = useId()
  const note = error || hint
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[13px] text-bone/75">
        {label}
        {required && <span className="text-cyan"> *</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-note` : undefined}
        className={`mt-1.5 h-10 w-full rounded-md border bg-white/[0.03] px-3 text-sm text-bone [color-scheme:dark] placeholder:text-mute focus:outline-none ${
          error ? 'border-red/70 focus:border-red' : 'border-white/15 focus:border-cyan'
        }`}
        {...rest}
      />
      {note && (
        <p id={`${id}-note`} className={`mt-1.5 text-[12px] ${error ? 'text-red' : 'text-mute'}`}>
          {note}
        </p>
      )}
    </div>
  )
}
