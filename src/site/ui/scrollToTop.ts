import type { MouseEvent } from 'react'

// "#top" is the Hero, which is `position: sticky` (the About curtain) — a
// browser anchor jump measures a stuck sticky element at its current on-screen
// spot, not the page top, so it lands hundreds of pixels down. Scroll to 0
// directly instead; CSS scroll-behavior keeps it smooth (and instant under
// prefers-reduced-motion).
export function scrollToTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  window.scrollTo({ top: 0 })
  history.replaceState(null, '', window.location.pathname + window.location.search)
}
