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
      {/* Hero: Unit-01 sits behind the name, with a scrim at the bottom so the
          type stays legible as the canvas moves. */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden border-b border-line">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-bg via-bg/85 to-transparent" />
        <span aria-hidden className="text-outline pointer-events-none absolute right-6 top-24 hidden font-display text-[190px] leading-none lg:block">
          01
        </span>

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-9 pt-32 sm:px-8 sm:pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line/80 pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint"
          >
            <span className="text-accent-2">// FILE 000 — TEST TYPE</span>
            <span>
              SYNC <span className="text-fg">98.7%</span>
            </span>
            <span className="hidden sm:inline">
              MAGI: <span className="text-accent-2">ONLINE</span>
            </span>
            <span className="hidden md:inline">20.59N 78.96E</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent"
          >
            {site.brand} // EVA INTERFACE
          </motion.p>

          <h1 className="glitch mt-3 font-display text-[clamp(62px,13vw,198px)]">
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
            <div className="max-w-xl">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
                {site.role} // {site.location}
              </p>
              <p className="mt-3 text-pretty text-[16.5px] leading-relaxed text-muted sm:text-[18px]">{site.intro}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
              <span className="inline-flex items-center gap-2">
                <span className={site.available ? 'size-1.5 animate-pulse bg-accent-2' : 'size-1.5 bg-faint'} />
                {site.available ? 'OPEN TO OPPORTUNITIES' : 'CURRENTLY BOOKED'}
              </span>
              <a href="#work" className="group inline-flex items-center gap-2 text-fg transition-colors hover:text-accent">
                SCROLL TO WORK
                <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b border-line bg-surface/50 py-3" aria-hidden>
        <ul className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.26em] text-muted">
          {[...site.marquee, ...site.marquee].map((item, i) => (
            <li key={i} className="flex items-center gap-8">
              <span className="text-accent">◆</span>
              {item}
              <span className="text-faint">//</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Work */}
      <section id="work" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-32">
        <SectionHead index="01" label="OPERATIONS" jp="作戦" title="Selected work" aside={`${projects.length} CLASSIFIED FILES`} />
        <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:gap-x-8 lg:gap-y-20">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="02" label="PILOT PROFILE" jp="操縦者" title="Human in the machine" aside="CLEARANCE A" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="relative border border-line bg-surface p-2">
              <Parallax src={asset('about.svg')} alt="Abstract render" className="aspect-[3/4] max-w-[460px]" strength={6} />
              <span className="absolute left-4 top-4 bg-bg/80 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-accent">VISUAL // SUBJECT</span>
              <span className="absolute bottom-4 right-4 font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">UNIT 01</span>
            </div>
          </Reveal>
          <div className="flex flex-col justify-center">
            <Lines
              as="h2"
              className="font-display text-balance text-[40px] sm:text-[54px] lg:text-[60px]"
              lines={['Intelligent systems,', 'interfaces people', 'actually use']}
            />
            <Reveal delay={0.2} className="mt-8 max-w-xl text-pretty text-[16.5px] leading-relaxed text-muted">
              <p>
                I am a developer with a deep love for coding and artificial intelligence. My work spans web development, AI implementation and the interfaces that make both usable, and I care about the last part as much as the model.
              </p>
              <p className="mt-4">Somewhere between a data problem and a person trying to get something done is where I like to work.</p>
            </Reveal>
            <Reveal delay={0.3} className="mt-8">
              <Link
                to="/about"
                className="notch-sm inline-flex items-center gap-2 border border-line-strong px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent hover:text-accent"
              >
                OPEN PERSONNEL FILE
                <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="03" label="ARMAMENT" jp="装備" title="Skills & expertise" aside="12 SYSTEMS SYNCED" />
        <Skills />
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="04" label="COMBAT RECORD" jp="戦績" title="Achievements" aside="3 ENTRIES // VERIFIED" />
        <Achievements />
      </section>
    </>
  )
}

function SectionHead({ index, label, jp, title, aside }: { index: string; label: string; jp: string; title: string; aside?: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line-strong" />
        <span>{label}</span>
        <span className="jp text-[11px] normal-case tracking-[0.12em] text-muted">{jp}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
        <Lines as="h2" className="font-display text-[42px] sm:text-[60px]" lines={[title]} />
        {aside && <Reveal className="pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{aside}</Reveal>}
      </div>
    </div>
  )
}

function Skills() {
  return (
    <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {skillGroups.map((group, groupIndex) => (
        <Reveal key={group.title} delay={groupIndex * 0.05}>
          <h3 className="border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-accent-2">{group.title}</h3>
          <ul className="mt-6 flex flex-col gap-5">
            {group.items.map((skill) => (
              <li key={skill.name}>
                <div className="flex items-baseline justify-between gap-3 text-[14px]">
                  <span>{skill.name}</span>
                  <span className="font-mono text-[9.5px] tabular-nums text-faint">{skill.level}%</span>
                </div>
                <div className="mt-2 h-[5px] w-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                    transition={{ duration: 1.1, delay: 0.1, ease }}
                    className="h-full bg-accent"
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
                'group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden border p-7 sm:p-9 md:min-h-0',
                featured
                  ? 'border-accent/50 bg-[radial-gradient(130%_140%_at_100%_0%,rgba(255,106,0,0.24),rgba(12,12,19,1)_62%)]'
                  : 'border-line bg-surface hover:border-accent-2/40',
              )}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] hazard-strip opacity-80" />
              <div className="relative flex items-center justify-between gap-4">
                <span className={cx('grid size-12 place-items-center border', featured ? 'border-transparent bg-accent text-black' : 'border-line-strong text-accent-2')}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-right font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">
                  {featured ? 'PRIORITY: S' : `ENTRY 0${i + 1}`} // {achievement.tag}
                </span>
              </div>

              <span
                aria-hidden
                className={cx('font-display pointer-events-none absolute -bottom-8 right-3 select-none leading-none', featured ? 'text-[190px] text-accent/15' : 'text-[120px] text-fg/[0.05]')}
              >
                {featured ? '1ST' : `0${i + 1}`}
              </span>

              <div className="relative mt-12">
                <h3 className={cx('font-display text-balance', featured ? 'text-[40px] sm:text-[54px]' : 'text-[30px]')}>{achievement.title}</h3>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">{achievement.detail}</p>
              </div>
            </motion.article>
          </Reveal>
        )
      })}
    </div>
  )
}
