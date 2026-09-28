import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.2, 0.7, 0.2, 1] as const

/**
 * Height-animated show/hide wrapper. Measures its content and animates to
 * an explicit pixel height rather than `'auto'` — animating *from* `'auto'`
 * is unreliable (confirmed here: it gets stuck at the pre-toggle height).
 * Measured synchronously on mount and re-measured on window resize, rather
 * than via ResizeObserver — this content doesn't reflow on its own, and a
 * resize listener needs no extra browser support to verify. Reused by the
 * Services accordion and, later, the FAQ accordion.
 */
export function Collapse({ open, id, children }: { open: boolean; id?: string; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const reduce = useReducedMotion()

  useLayoutEffect(() => {
    const measure = () => {
      if (contentRef.current) setHeight(contentRef.current.scrollHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <motion.div
      id={id}
      initial={false}
      animate={{ height: open ? height : 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease }}
      className="overflow-hidden"
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  )
}
