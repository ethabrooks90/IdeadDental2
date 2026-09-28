import { lazy, Suspense } from 'react'
import { motionValue } from 'framer-motion'
import Header from './site/Header'
import Hero from './site/hero/Hero'
import About from './site/About'
import Services from './site/Services'
import Testimonials from './site/Testimonials'
import ToothExplorer from './site/ToothExplorer'
import Technology from './site/Technology'
import Doctors from './site/Doctors'
import Results from './site/Results'
import Insurance from './site/Insurance'
import FAQ from './site/FAQ'
import Contact from './site/Contact'
import SectionPlaceholder from './site/SectionPlaceholder'
import Footer from './site/Footer'
import { sections, type SiteSection } from './site/sections'

// Dark rebuild (branch dark-rebuild). Header, Hero and About are built;
// every other section renders its placeholder from sections.ts. To build
// one, add it to `built` below (flip its `status` to 'built' in
// sections.ts first) and create its component. The previous light-theme
// components in src/components/ are no longer imported and are kept only
// as reference until the rebuild is done.

const ToothScene = lazy(() => import('./site/hero/ToothScene'))

const built: Partial<Record<SiteSection['id'], React.ComponentType>> = {
  about: About,
  services: Services,
  anatomy: ToothExplorer,
  technology: Technology,
  doctors: Doctors,
  results: Results,
  insurance: Insurance,
  faq: FAQ,
  contact: Contact,
  testimonials: Testimonials,
}

// The pinned section first, then the sections that rise over it.
const CURTAIN_GROUP: SiteSection['id'][] = ['services', 'anatomy', 'technology']

function App() {
  // `?still` renders only the 3D model on a transparent canvas — used by
  // scripts/render-hero-still.mjs to produce the hero's static fallback.
  if (new URLSearchParams(window.location.search).has('still')) return <StillStage />

  const [firstSection, ...restSections] = sections
  const FirstBuilt = built[firstSection.id]

  const renderSection = (s: SiteSection) => {
    const Built = built[s.id]
    return Built ? <Built key={s.id} /> : <SectionPlaceholder key={s.id} section={s} index={sections.indexOf(s)} />
  }
  // Services stays pinned (sticky, see Services.tsx) while the light
  // Tooth explorer + Technology panel rises over it — this wrapper bounds
  // that sticky range to the three, like the Hero/About pair above.
  const [curtainStart, ...curtainCover] = CURTAIN_GROUP
  const inCurtain = (s: SiteSection) => curtainCover.includes(s.id)

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Header />
      <main id="main">
        {/* Wrapper bounds Hero's sticky range to just this pair — it stays
            pinned in place only while the next section's rounded-top panel
            rises up over it like a sheet being pulled up, then that section
            scrolls away normally instead of the sticky bleeding under
            everything after it. Same technique as the Services curtain
            group below. */}
        <div className="relative">
          <Hero />
          {FirstBuilt ? <FirstBuilt /> : <SectionPlaceholder section={firstSection} index={0} />}
        </div>
        {restSections
          .filter((s) => !inCurtain(s))
          .map((s) =>
            s.id === curtainStart ? (
              <div key="curtain" className="relative">
                {sections.filter((x) => CURTAIN_GROUP.includes(x.id)).map(renderSection)}
              </div>
            ) : (
              renderSection(s)
            ),
          )}
      </main>
      <Footer />
    </div>
  )
}

// Wide aspect (not square) — the still is now a full-bleed hero background
// cropped with object-cover, same as a real photo would be, so it needs to
// be rendered in roughly that shape rather than a centered square.
function StillStage() {
  return (
    <div id="still-stage" style={{ position: 'relative', width: 1920, height: 1080, background: 'transparent' }}>
      <Suspense fallback={null}>
        <ToothScene
          still
          scroll={motionValue(0)}
          onReady={() => ((window as Window & { __stillReady?: boolean }).__stillReady = true)}
        />
      </Suspense>
    </div>
  )
}

export default App
