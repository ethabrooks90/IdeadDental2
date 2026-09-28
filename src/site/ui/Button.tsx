import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onCyan'

const base =
  'group inline-flex items-center justify-center gap-2.5 rounded-md font-medium whitespace-nowrap transition-colors duration-300 ease-(--ease-out-soft)'

const variants: Record<Variant, string> = {
  primary: 'bg-cyan text-ink hover:bg-bone',
  secondary: 'border border-white/15 bg-white/[0.03] text-bone hover:border-white/35 hover:bg-white/[0.07]',
  ghost: 'text-bone/80 hover:text-bone',
  // For use directly on a solid bg-cyan surface — primary/secondary both
  // disappear or wash out there (primary is literally the same colour;
  // secondary's white-on-dark tones read as near-invisible on bright cyan).
  onCyan: 'border border-ink/25 text-ink hover:bg-ink hover:text-cyan',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-[13px]',
  bar: 'h-8 px-4 text-[13px]',
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant
  size?: keyof typeof sizes
  arrow?: boolean
  children: ReactNode
}

export function ButtonLink({ variant = 'primary', size = 'md', arrow, className = '', children, ...rest }: Props) {
  return (
    <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
      {arrow && (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-3.5 transition-transform duration-300 ease-(--ease-out-soft) group-hover:translate-x-0.5"
        >
          <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
    </a>
  )
}

/** Small uppercase section label with the leading dot — "● OUR TECHNOLOGY".
 *  `tone="light"` is for use directly on a solid bg-cyan surface, where the
 *  default mute-text/cyan-dot styling (built for dark backgrounds) would
 *  either wash out or vanish entirely (a cyan dot on a cyan surface). */
export function Eyebrow({
  children,
  className = '',
  tone = 'dark',
}: {
  children: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}) {
  const textColor = tone === 'light' ? 'text-ink/70' : 'text-mute'
  const dotColor = tone === 'light' ? 'bg-ink' : 'bg-cyan'
  return (
    <p className={`flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] ${textColor} uppercase ${className}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dotColor}`} />
      {children}
    </p>
  )
}
