import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

/**
 * A hairline that tracks reading progress, in the same spirit as the
 * persistent scroll cues on scroll-driven studio sites.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent-2" />
}

/**
 * A pinned statement: the section holds the viewport while the copy scales,
 * drifts and fades with scroll, then releases. This is the scroll-scrubbed
 * beat that gives long studio pages their rhythm.
 */
export function PinnedStatement() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.9, 1, 0.95])
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.8, 1], [0.4, 1, 1, 0.45])
  const x = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])
  const line = useTransform(scrollYProgress, [0.15, 0.6], [0, 1])

  return (
    <section ref={ref} aria-label="Statement" className="relative h-[180vh] border-y border-line">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 opacity-20" />
        <div aria-hidden className="absolute inset-x-5 top-24 h-px bg-line sm:inset-x-8" />

        <motion.div style={reduced ? undefined : { scale, opacity, x }} className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
            <span>
              <span className="text-accent">03</span> // PHILOSOPHY
              <span className="jp ml-2 text-[11px] normal-case tracking-[0.12em] text-muted">哲学</span>
            </span>
            <span className="hidden sm:inline">SCROLL VECTOR // ACTIVE</span>
          </div>

          <h2 className="mt-6 font-display text-[clamp(38px,7.6vw,118px)] leading-[0.88]">
            Intelligence is only <span className="text-outline">half</span> the mission.
            <br />
            <span className="text-accent">The interface</span> is the rest.
          </h2>

          <motion.div style={{ scaleX: line }} className="mt-10 h-px origin-left bg-accent" />

          <div className="mt-5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.2em] text-faint">
            <span>↓ CONTINUE TO SCROLL</span>
            <span className="text-accent-2">● SYNC 100%</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
