import { site } from '../../data/site'

/**
 * The frame the whole film sits inside: gold corner marks, a hairline inset,
 * vertical captions and the moon seal. Purely decorative and
 * pointer-events-none, so it never intercepts the page.
 */
export function SceneChrome() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute inset-4 hidden border border-accent-3/15 md:block" />

      <span className="absolute left-4 top-4 hidden size-5 border-l border-t border-accent-3/60 md:block" />
      <span className="absolute right-4 top-4 hidden size-5 border-r border-t border-accent-3/60 md:block" />
      <span className="absolute bottom-4 left-4 hidden size-5 border-b border-l border-accent-3/60 md:block" />
      <span className="absolute bottom-4 right-4 hidden size-5 border-b border-r border-accent-3/60 md:block" />

      <div className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.34em] text-faint/85 md:block">
        {site.character} · {site.epithet}
      </div>
      <div className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.34em] text-faint/85 md:block">
        SENTINEL OF {site.realm}
      </div>

      <div className="absolute bottom-5 left-7 hidden items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint/80 md:flex">
        <span className="crescent size-2 text-accent-2" />
        20.59N 78.96E · INDIA
      </div>
      <div className="absolute bottom-5 right-7 hidden items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint/80 md:flex">
        RESONANCE
        <span className="size-1 animate-pulse rounded-full bg-accent" />
      </div>
    </div>
  )
}
