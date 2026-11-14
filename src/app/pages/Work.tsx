import { motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import { bySlug, projects } from '../../data/site'
import { Lines, Parallax, Reveal } from '../components/motion'

const ease = [0.22, 1, 0.36, 1] as const

export function Work() {
  const { slug } = useParams()
  const project = slug ? bySlug(slug) : undefined
  if (!project) return <Navigate to="/" replace />
  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]
  const nextNumber = String(((index + 1) % projects.length) + 1).padStart(2, '0')

  const facts: Array<[string, string]> = [
    ['CLIENT', project.client],
    ['ROLE', project.role.join(', ')],
    ['KEY FEATURES', project.deliverables.join(', ')],
  ]
  if (project.year) facts.splice(1, 0, ['YEAR', project.year])
  if (project.stack) facts.push(['TECHNOLOGY', project.stack.join(', ')])

  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-36">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
        <Link to="/#work" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent-2">
          <ArrowLeft className="size-3.5" />
          ALL WORK
        </Link>
        <span className="text-accent-2">STUDY · 0{index + 1}</span>
        <span className="text-accent-3">● LIVE</span>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <Lines as="h1" className="font-display bloom text-[clamp(56px,10vw,150px)]" lines={[project.title]} />
        <Reveal delay={0.2} className="max-w-md border-l border-accent-3/50 pl-4 text-pretty text-[16px] leading-relaxed text-muted lg:pb-4">
          {project.summary}
        </Reveal>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease }}
        className="relative mt-12 border border-line bg-surface/60 p-2 backdrop-blur-sm"
      >
        <div className="overflow-hidden" style={{ background: project.tint }}>
          <Parallax src={project.cover} alt={project.title} className="aspect-[16/10] sm:aspect-[16/9]" strength={5} reveal />
        </div>
        <span className="absolute left-5 top-5 bg-bg/80 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-accent-2">● FRAME</span>
        <span className="absolute bottom-5 right-5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">SCALE 1:1</span>
      </motion.div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-24">
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 text-[13px] lg:grid-cols-1">
            {facts.map(([label, value]) => (
              <div key={label} className="border-l border-line pl-3">
                <dt className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-faint">{label}</dt>
                <dd className="mt-1.5 text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg transition-colors hover:bg-accent hover:text-fg"
            >
              VISIT LIVE PROJECT
              <ArrowUpRight className="size-4" />
            </a>
          )}
        </Reveal>

        <div className="max-w-2xl">
          {project.body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className={i === 0 ? 'text-pretty text-[25px] font-medium leading-[1.25] tracking-tight text-fg sm:text-[32px]' : 'mt-6 text-[16.5px] leading-relaxed text-muted'}>
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Detail crops only make sense for photographs. The drawn project
          plates would cut through UI text, so they are shown once, large. */}
      {!/\.svg$/i.test(project.cover) && (
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="image-frame aspect-[4/3]" style={{ background: project.tint }}>
              <img src={project.cover} alt="" className="size-full object-cover" style={{ transform: 'scale(1.6)', transformOrigin: '30% 40%' }} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="image-frame aspect-[4/3]" style={{ background: project.tint }}>
              <img src={project.cover} alt="" className="size-full object-cover" style={{ transform: 'scale(2.2)', transformOrigin: '70% 65%' }} />
            </div>
          </Reveal>
        </div>
      )}

      <Link to={`/work/${next.slug}`} className="group mt-32 block border-t border-line">
        <div aria-hidden className="h-[2px] rule-tick opacity-70" />
        <div className="flex items-end justify-between gap-6 pt-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">NEXT STUDY · {nextNumber}</p>
            <h2 className="font-display mt-3 text-[clamp(44px,8vw,120px)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
              {next.title}
            </h2>
          </div>
          <span className="image-frame hidden aspect-[4/3] w-[260px] shrink-0 border border-line sm:block" style={{ background: next.tint }}>
            <img src={next.cover} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </span>
        </div>
      </Link>
    </article>
  )
}
