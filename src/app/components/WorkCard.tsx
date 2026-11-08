import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import type { Project } from '../../data/site'
import { cx } from '../lib/cx'
import { Parallax } from './motion'

/**
 * Cards answer the pointer in 3D: the whole card rotates toward the cursor
 * while the cover sits on a raised layer, so the tilt reads as depth rather
 * than a skew. Springs keep it from feeling twitchy.
 */
export function WorkCard({ project, index = 0 }: { project: Project; index?: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hover, setHover] = useState(false)
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cx(project.size === 'large' ? 'md:col-span-2' : 'md:col-span-1')}
    >
      <motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }} className="card-3d">
        <Link
          ref={ref}
          to={`/work/${project.slug}`}
          className="group relative block"
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
            rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * 11)
            rotateX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 11)
          }}
        >
          <div
            className={cx('relative overflow-hidden rounded-image will-change-transform', project.size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-[4/4.6]')}
            style={{ background: project.tint, transform: 'translateZ(30px)' }}
          >
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
              <Parallax src={project.cover} alt={project.title} className="size-full" strength={6} />
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10 opacity-80" />
            <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10.5px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
              {project.year ? `${project.year} · ` : ''}
              {project.category}
            </span>
            <motion.span
              aria-hidden
              style={{ x, y }}
              className={cx(
                'pointer-events-none absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-[14px] bg-fg px-4 py-2.5 text-[13px] font-medium text-bg transition-[opacity,scale] duration-300 md:flex',
                hover ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            >
              View project
            </motion.span>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4" style={{ transform: 'translateZ(16px)' }}>
            <h3 className="font-display text-[28px] sm:text-[32px]">{project.title}</h3>
            <p className="shrink-0 text-[13.5px] text-muted">
              {project.client}
              {project.year && <span className="ml-3 tabular-nums text-faint">{project.year}</span>}
            </p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
