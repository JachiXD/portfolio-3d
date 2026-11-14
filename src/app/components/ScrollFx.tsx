import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

/**
 * A hairline that tracks reading progress: the ribbon running through the
 * whole film.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent via-accent to-accent-3"
    />
  )
}

/**
 * A pinned chapter: the section holds the viewport while the copy scales,
 * drifts and fades with scroll, then releases. This is the scroll-scrubbed
 * beat that gives long cinematic pages their rhythm.
 */
export function PinnedStatement() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.92, 1, 0.96])
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.8, 1], [0.3, 1, 1, 0.4])
  const x = useTransform(scrollYProgress, [0, 1], ['-2.5%', '2.5%'])
  const line = useTransform(scrollYProgress, [0.15, 0.6], [0, 1])
  const moonY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])

  return (
    <section ref={ref} aria-label="Resonance" className="relative h-[190vh] border-y border-accent-3/15">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <motion.div style={reduced ? undefined : { y: moonY }} aria-hidden className="moon-disc absolute -right-[18%] top-1/2 size-[70vmin] -translate-y-1/2 opacity-25 blur-sm" />
        <div aria-hidden className="silk absolute inset-0 opacity-50" />
        <div aria-hidden className="absolute inset-x-5 top-24 h-px bg-gradient-to-r from-transparent via-accent-3/40 to-transparent sm:inset-x-8" />

        <motion.div style={reduced ? undefined : { scale, opacity, x }} className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
            <span className="inline-flex items-center gap-3">
              <span className="crescent size-2.5 text-accent-2" />
              <span>
                <span className="text-accent">參</span> // RESONANCE
              </span>
              <span className="jp text-[11px] normal-case tracking-[0.12em] text-muted">共鳴</span>
            </span>
            <span className="hidden sm:inline">FREQUENCY HELD</span>
          </div>

          <h2 className="mt-7 font-display text-[clamp(38px,7.4vw,116px)] leading-[0.95]">
            You only live <span className="text-outline">once</span>,
            <br />
            but if you do it right, once is <span className="text-accent-2">enough</span>.
          </h2>

          <motion.div style={{ scaleX: line }} className="mt-10 h-px origin-left bg-gradient-to-r from-accent via-accent-3 to-transparent" />

          <div className="mt-5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.2em] text-faint">
            <span>↓ KEEP SCROLLING</span>
            <span className="text-accent-3">— MAE WEST</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
