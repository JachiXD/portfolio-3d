import { motion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Code2, Cpu, Trophy } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { Link } from 'react-router'

import { achievements, asset, projects, site, skillGroups } from '../../data/site'
import { Lines, Parallax, Reveal } from '../components/motion'
import { WorkCard } from '../components/WorkCard'
import { cx } from '../lib/cx'

const ease = [0.22, 1, 0.36, 1] as const

// three.js is only needed for the hero, so it loads after the page is already
// readable instead of holding up first paint.
const HeroScene = lazy(() => import('../components/HeroScene').then((m) => ({ default: m.HeroScene })))

export function Home() {
  return (
    <>
      {/* Hero: a live scene sits behind the name, with a scrim at the bottom
          so the type stays legible as the canvas moves. */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-bg via-bg/85 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-9 pt-32 sm:px-8 sm:pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted sm:text-[12px]"
          >
            <span className="inline-flex items-center gap-2">
              <span className={site.available ? 'round size-1.5 animate-pulse rounded-full bg-accent' : 'round size-1.5 rounded-full bg-faint'} />
              {site.available ? 'Open to opportunities' : 'Currently booked'}
            </span>
            <span className="text-faint">—</span>
            <span>{site.role}</span>
            <span className="hidden text-faint sm:inline">/</span>
            <span className="hidden sm:inline">{site.location}</span>
          </motion.div>

          <h1 className="font-display text-[clamp(60px,13vw,204px)]">
            {site.name.split(' ').map((word, i) => (
              <span key={word} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease }}>
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease }}
            className="mt-8 flex flex-col gap-6 border-t border-line/80 pt-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <p className="max-w-xl text-pretty text-[17px] leading-relaxed text-muted sm:text-[19px]">{site.intro}</p>
            <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-faint">
              <a href="#work" className="group inline-flex items-center gap-2 transition-colors hover:text-fg">
                Scroll to work
                <ArrowDown className="size-4 transition-transform duration-500 group-hover:translate-y-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-line py-5" aria-hidden>
        <ul className="font-display flex w-max animate-marquee items-center gap-10 whitespace-nowrap text-[28px] text-fg/60 sm:text-[36px]">
          {[...site.marquee, ...site.marquee].map((item, i) => (
            <li key={i} className="flex items-center gap-10">
              {item}
              <span className="round size-1.5 rounded-full bg-accent" />
            </li>
          ))}
        </ul>
      </div>

      {/* Work */}
      <section id="work" className="relative mx-auto max-w-[1400px] scroll-mt-20 px-5 pt-24 sm:px-8 sm:pt-32">
        <div className="flex items-end justify-between">
          <Lines as="h2" className="font-display text-[44px] sm:text-[64px]" lines={['Selected work']} />
          <Reveal className="hidden text-[14px] text-muted sm:block">{projects.length} featured projects</Reveal>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:gap-x-8 lg:gap-y-20">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <Parallax src={asset('about.svg')} alt="Abstract render" className="aspect-[3/4] max-w-[460px] rounded-image" strength={6} />
          </Reveal>
          <div className="flex flex-col justify-center">
            <Lines
              as="h2"
              className="font-display text-balance text-[40px] sm:text-[56px] lg:text-[64px]"
              lines={['Intelligent systems,', 'interfaces people', 'actually use']}
            />
            <Reveal delay={0.2} className="mt-8 max-w-xl text-pretty text-[17px] leading-relaxed text-muted">
              <p>
                I am a developer with a deep love for coding and artificial intelligence. My work spans web development, AI implementation and the interfaces that make both usable, and I care about the last part as much as the model.
              </p>
              <p className="mt-4">Somewhere between a data problem and a person trying to get something done is where I like to work.</p>
            </Reveal>
            <Reveal delay={0.3} className="mt-8">
              <Link to="/about" className="link-draw inline-flex items-center gap-1.5 text-[15px] font-medium">
                More about me
                <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <Lines as="h2" className="font-display text-[40px] sm:text-[56px]" lines={['Skills & expertise']} />
          <Reveal delay={0.1} className="max-w-xs text-[15px] text-muted sm:text-right">
            What I work with, and how comfortably.
          </Reveal>
        </div>
        <Skills />
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <div className="flex items-end justify-between gap-6">
          <Lines as="h2" className="font-display text-[40px] sm:text-[56px]" lines={['Achievements']} />
          <Reveal delay={0.1} className="hidden max-w-[220px] text-right text-[14px] leading-relaxed text-muted sm:block">
            Three things worth showing, not telling.
          </Reveal>
        </div>
        <Achievements />
      </section>
    </>
  )
}

function Skills() {
  return (
    <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {skillGroups.map((group, groupIndex) => (
        <Reveal key={group.title} delay={groupIndex * 0.05}>
          <h3 className="border-b border-line pb-3 text-[12px] uppercase tracking-[0.18em] text-muted">{group.title}</h3>
          <ul className="mt-6 flex flex-col gap-5">
            {group.items.map((skill) => (
              <li key={skill.name}>
                <div className="flex items-baseline justify-between gap-3 text-[14.5px]">
                  <span>{skill.name}</span>
                  <span className="tabular-nums text-faint">{skill.level}%</span>
                </div>
                <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                    transition={{ duration: 1.1, delay: 0.1, ease }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  )
}

const achievementIcons = [Trophy, Cpu, Code2]

function Achievements() {
  return (
    <div className="mt-12 grid gap-5 md:auto-rows-fr md:grid-cols-3">
      {achievements.map((achievement, i) => {
        const Icon = achievementIcons[i] ?? Trophy
        const featured = i === 0
        return (
          <Reveal key={achievement.title} delay={i * 0.08} className={featured ? 'md:col-span-2 md:row-span-2' : ''}>
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className={cx(
                'group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[30px] border p-7 sm:p-9 md:min-h-0',
                featured
                  ? 'border-accent/40 bg-[radial-gradient(130%_140%_at_100%_0%,rgba(255,90,43,0.30),rgba(18,17,16,1)_62%)]'
                  : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <span
                aria-hidden
                className={cx(
                  'font-display pointer-events-none absolute -bottom-6 right-4 select-none tabular-nums leading-none',
                  featured ? 'text-[170px] text-accent/20' : 'text-[120px] text-fg/[0.045]',
                )}
              >
                {featured ? '1st' : `0${i + 1}`}
              </span>
              <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/20 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between gap-4">
                <span
                  className={cx(
                    'grid size-12 place-items-center rounded-[16px] border',
                    featured ? 'border-transparent bg-accent text-[#120b08]' : 'border-line-strong text-accent',
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.2em] text-faint">{achievement.tag}</span>
              </div>

              <div className="relative mt-12">
                <h3 className={cx('font-display text-balance', featured ? 'text-[40px] sm:text-[54px]' : 'text-[30px] sm:text-[34px]')}>
                  {achievement.title}
                </h3>
                <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">{achievement.detail}</p>
              </div>
            </motion.article>
          </Reveal>
        )
      })}
    </div>
  )
}
