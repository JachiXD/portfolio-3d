import { site } from '../../data/site'

/**
 * Fixed instrumentation that sits over the whole site: scanlines, bandage
 * hairlines, a hairline frame, corner brackets and vertical labels. Purely
 * decorative and pointer-events-none, so it never gets in the way of the page.
 */
export function EvaChrome() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <div className="scanlines absolute inset-0 opacity-[0.1]" />
      <div className="bandage absolute inset-y-0 left-0 w-24 opacity-40 md:w-32" />
      <div className="bandage absolute inset-y-0 right-0 w-24 opacity-40 md:w-32" />

      <div className="absolute inset-3 hidden border border-fg/[0.06] md:block" />
      <div className="absolute inset-y-6 left-3 hidden w-px bg-accent/40 md:block" />
      <div className="absolute inset-y-6 right-3 hidden w-px bg-accent-3/40 md:block" />

      <span className="absolute left-3 top-3 hidden size-4 border-l border-t border-accent/70 md:block" />
      <span className="absolute right-3 top-3 hidden size-4 border-r border-t border-accent/70 md:block" />
      <span className="absolute bottom-3 left-3 hidden size-4 border-b border-l border-accent/70 md:block" />
      <span className="absolute bottom-3 right-3 hidden size-4 border-b border-r border-accent/70 md:block" />

      <div className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.34em] text-faint/80 md:block">
        {site.codename} // {site.epithet} — MANIFOLD
      </div>
      <div className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.34em] text-faint/80 md:block">
        JACHI_PORTFOLIO // 2026
      </div>

      <div className="absolute bottom-4 left-6 hidden items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint/70 md:flex">
        <span className="size-1 bg-accent-2" />
        20.59N 78.96E // INDIA
      </div>
      <div className="absolute bottom-4 right-6 hidden items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint/70 md:flex">
        MAGI: ONLINE
        <span className="size-1 animate-pulse bg-accent-2" />
      </div>
    </div>
  )
}
