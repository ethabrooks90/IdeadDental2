// Single source of truth for the page's sections. Header, the full-screen
// menu, and every not-yet-built section read from here, so building a section
// later means: create its component, swap it in for the placeholder in
// App.tsx, and flip `status` to 'built'. The `plan` lines are the agreed
// Phase 2 scope for each section and the `data` hint points at the verified
// content already sitting in src/data/content.ts.

export type SiteSection = {
  id: string
  label: string
  title: string
  inHeader?: boolean
  status: 'built' | 'placeholder'
  plan: string[]
  data?: string
}

export const sections: SiteSection[] = [
  {
    id: 'about',
    label: 'About',
    title: 'A patient-first practice in Houston',
    status: 'built',
    plan: [
      'Real intro and philosophy copy',
      'Verified facts only: 2 doctors, ES / EN, walk-in days — no invented stats',
      'Feature grid: iTero, Piezotome, bilingual care, 75″ TVs, insurance',
    ],
    data: 'aboutCopy, features, hours',
  },
  {
    id: 'services',
    label: 'Services',
    title: 'General, restorative, cosmetic and orthodontic care',
    inHeader: true,
    status: 'built',
    plan: ['Four categories with their real treatment lists', 'Service photography, hover/focus detail'],
    data: 'serviceCategories',
  },
  {
    id: 'anatomy',
    label: 'Tooth explorer',
    title: 'Explore the tooth',
    status: 'built',
    plan: [
      '3D tooth with labelled hotspots (enamel, crown, root, pulp)',
      'Each hotspot opens a panel linking to the matching service',
      'Keyboard-accessible; list fallback on mobile / no WebGL',
    ],
    data: 'serviceCategories (links only — no new medical claims)',
  },
  {
    id: 'technology',
    label: 'Technology',
    title: 'The newest technology',
    inHeader: true,
    status: 'built',
    plan: ['iTero Element Scanner and Piezotome Cube Extraction', 'Click-to-load YouTube embeds'],
    data: 'technology',
  },
  {
    id: 'doctors',
    label: 'Doctors',
    title: 'Meet our doctors',
    inHeader: true,
    status: 'built',
    plan: ['Dr. Stephanie Vu and Dr. Nakul Rathi', 'Monochrome portraits that colour on hover/focus, full bios'],
    data: 'doctors',
  },
  {
    id: 'results',
    label: 'Results',
    title: 'Before & after',
    inHeader: true,
    status: 'built',
    plan: ['Real before/after gallery photos', 'Shown separately from reviews — no implied patient pairing'],
    data: 'results',
  },
  {
    id: 'testimonials',
    label: 'Reviews',
    title: 'What patients say',
    status: 'built',
    plan: ['The four real reviews, unedited'],
    data: 'testimonials',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    title: 'Insurance & payment',
    status: 'built',
    plan: [
      '“We accept all insurance plans” + payment plans',
      'Price list — updated by the practice 2026-10-01, published',
    ],
    data: 'pricing',
  },
  {
    id: 'faq',
    label: 'FAQ',
    title: 'Frequently asked questions',
    status: 'built',
    plan: ['Categorised accordion — answers need client sign-off'],
    data: 'faqs',
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Request an appointment',
    inHeader: true,
    status: 'built',
    plan: ['Request form (general info only, staff call to confirm)', 'Hours table, map link, Call / Text'],
    data: 'business, hours',
  },
]

export const headerNav = sections.filter((s) => s.inHeader)
