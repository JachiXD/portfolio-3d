import { motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'

import { cx } from '../lib/cx'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Lines of text that rise out of a mask, one after another. The wrapper is
 * what gets observed: a line translated out of its overflow-hidden mask has
 * no visible area, so observing the line itself would never fire.
 */
export function Lines({ lines, className, delay = 0, as: Tag = 'h1' }: { lines: ReactNode[]; className?: string; delay?: number; as?: 'h1' | 'h2' | 'p' }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' })
  const reduced = useReducedMotion()
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block origin-left"
            initial={reduced ? { opacity: 0 } : { y: '112%', rotate: 2.5 }}
            animate={inView ? { y: 0, rotate: 0, opacity: 1 } : reduced ? { opacity: 0 } : { y: '112%', rotate: 2.5 }}
            transition={{ duration: 1.25, delay: delay + i * 0.1, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/**
 * The house entrance: a block rises, sharpens out of a blur and settles from
 * a slightly smaller scale. This is the arrival motion used across the site,
 * so sections feel like they resolve on screen rather than simply appear.
 */
export function Reveal({ children, delay = 0, className, y = 56 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, scale: 0.975, filter: 'blur(10px)' }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.15, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

/**
 * An image that drifts slower than the page while it scrolls past. With
 * `reveal`, it opens like a curtain from the centre and settles out of a much
 * wider crop, the way scroll-driven studio pages unveil their media.
 */
export function Parallax({ src, alt, className, strength = 8, reveal = false }: { src: string; alt: string; className?: string; strength?: number; reveal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`])
  const scale = useTransform(scrollYProgress, [0, 0.45], [1.32, 1.01])
  const inset = useTransform(scrollYProgress, [0, 0.4], ['22%', '0%'])
  const clipPath = useMotionTemplate`inset(${inset} 0% ${inset} 0%)`
  return (
    <div ref={ref} className={cx('image-frame relative', className)}>
      <motion.div style={reveal && !reduced ? { clipPath } : undefined} className="absolute inset-0">
        <motion.img
          src={src}
          alt={alt}
          style={reveal && !reduced ? { y, scale } : reduced ? undefined : { y }}
          className={cx('absolute inset-0 size-full object-cover', !reveal && 'scale-[1.12]')}
          loading="lazy"
        />
      </motion.div>
    </div>
  )
}

/** A button that leans toward the cursor. */
export function Magnetic({ children, className, strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cx('inline-block', className)}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((e.clientX - rect.left - rect.width / 2) * strength)
        y.set((e.clientY - rect.top - rect.height / 2) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
