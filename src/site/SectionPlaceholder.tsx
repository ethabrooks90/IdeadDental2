import type { SiteSection } from './sections'
import { Eyebrow } from './ui/Button'

// Stand-in for a section that hasn't been built yet. Keeps its anchor id so
// navigation already works, and shows the agreed scope so it's obvious in
// review what still needs doing. Replace with the real component in App.tsx.
export default function SectionPlaceholder({ section, index }: { section: SiteSection; index: number }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-28">
        <div>
          <Eyebrow>
            {String(index + 1).padStart(2, '0')} · {section.label}
          </Eyebrow>
          <h2
            id={`${section.id}-title`}
            className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.04] font-light tracking-[-0.03em] text-bone/45"
          >
            {section.title}
          </h2>
        </div>

        <div className="rounded-[14px] border border-dashed border-white/15 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] tracking-[0.12em] text-mute uppercase">
            Placeholder — not built yet
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-bone/60">
            {section.plan.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-white/30" />
                {line}
              </li>
            ))}
          </ul>
          {section.data && (
            <p className="mt-6 text-xs text-mute">
              Content source: <code className="text-bone/60">data/content.ts → {section.data}</code>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
