import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import type { Project } from '../../data/site'
import { cx } from '../lib/cx'
import { Parallax } from './motion'

/**
 * Cards answer the pointer in 3D: the whole card rotates toward the cursor
 * while the cover sits on a raised layer, so the tilt reads as depth rather
 * than a skew. Springs keep it from feeling twitchy.
 *
 * A project with a live site gets that site behind its cover — the plate is
 * what people try to click — while the title stays the way into the study.
 */
export function WorkCard({ project, index = 0 }: { project: Project; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 72, scale: 0.955, rotateX: 7, filter: 'blur(12px)' }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.2, delay: (index % 2) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200 }}
      className={cx(project.size === 'large' ? 'md:col-span-2' : 'md:col-span-1')}
    >
      <motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }} className="card-3d">
        <div
          ref={ref}
          className="group relative block border border-line bg-surface/70 p-2 backdrop-blur-sm transition-colors hover:border-accent/60"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => {
            setHover(false)
            rotateX.set(0)
            rotateY.set(0)
          }}
          onMouseMove={(e) => {
            const rect = ref.current?.getBoundingClientRect()
            if (!rect) return
            x.set(e.clientX - rect.left)
            y.set(e.clientY - rect.top)
            rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * 9)
            rotateX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 9)
          }}
        >
          <div className="flex items-center justify-between gap-3 px-1 pb-2 font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">
            <span className="text-accent-2">工作 · 0{index + 1}</span>
            <span>{project.category}</span>
          </div>

          <div
            className={cx('relative overflow-hidden border border-line/60', project.size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-[4/4.6]')}
            style={{ background: project.tint, transform: 'translateZ(30px)' }}
          >
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
              <Parallax src={project.cover} alt={project.title} className="size-full" strength={6} />
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/15" />
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 border border-white/20 bg-black/45 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
              <span className="size-1 rounded-full bg-accent-3" />
              {project.year ? `${project.year} · ` : ''}
              {project.category}
            </span>
            <motion.span
              aria-hidden
              style={{ x, y }}
              className={cx(
                'pointer-events-none absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-accent px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-fg transition-[opacity,scale] duration-300 md:flex',
                hover ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            >
              {project.link ? 'OPEN LIVE SITE' : 'OPEN STUDY'}
              <span aria-hidden>↗</span>
            </motion.span>
            {/* The drawn plates already carry their own footer line. */}
            {!project.cover.endsWith('.svg') && (
              <span aria-hidden className="absolute bottom-3 right-3 font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">SCALE 1:1</span>
            )}

            {project.link ? (
              // The cover is the thing people try to click on a live project, so it
              // opens the site. The study stays reachable through the title below.
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} — live project`}
                className="absolute inset-0 z-10 flex items-end justify-start p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <span className="inline-flex items-center gap-1.5 border border-white/25 bg-black/50 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-fg">
                  LIVE PROJECT
                  <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </span>
              </a>
            ) : (
              <Link
                to={`/work/${project.slug}`}
                aria-label={`Open ${project.title} study`}
                className="absolute inset-0 z-10 flex items-end justify-start p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <span className="inline-flex items-center gap-1.5 border border-white/25 bg-black/50 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-fg">
                  VIEW STUDY
                  <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </span>
              </Link>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-4 px-1" style={{ transform: 'translateZ(16px)' }}>
            <h3 className="font-display text-[27px] sm:text-[32px]">
              <Link
                to={`/work/${project.slug}`}
                className="transition-colors hover:text-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {project.title}
              </Link>
            </h3>
            <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:text-accent-2">
              {project.client}
              {project.year && <span className="ml-2 tabular-nums text-faint">{project.year}</span>}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
