import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowUpRight, Code2, Cpu, Trophy } from 'lucide-react'
import { Suspense, lazy, useRef } from 'react'
import { Link } from 'react-router'

import { achievements, asset, characterSheet, projects, site, skillGroups } from '../../data/site'
import { Lines, Parallax, Reveal } from '../components/motion'
import { PinnedStatement } from '../components/ScrollFx'
import { TiltDeck } from '../components/TiltDeck'
import { BACKGROUND_STILL } from '../components/WorldBackground'
import { WorkCard } from '../components/WorkCard'
import { cx } from '../lib/cx'

const ease = [0.22, 1, 0.36, 1] as const

// three.js is only needed for the hero, so it loads after the page is already
// readable instead of holding up first paint.
const HeroScene = lazy(() => import('../components/HeroScene').then((m) => ({ default: m.HeroScene })))

export function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0])
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.16])
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <>
      {/* Chapter 壹 — the opening shot. The sculpture keeps its own motion; the
          copy sinks and the scene pushes in as the page starts to move. */}
      <section ref={heroRef} className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden border-b border-accent-3/15 md:justify-end">
        <motion.div
          style={reduced ? undefined : { scale: sceneScale, y: sceneY }}
          className="relative mt-14 h-[36svh] min-h-[240px] w-full shrink-0 md:absolute md:inset-0 md:mt-0 md:h-auto md:min-h-0"
        >
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </motion.div>

        {/* Two-stage vignette so the key art stays visible up top while the
            name and intro sit on solid dark ground. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-bg via-bg/80 to-transparent md:h-[68%]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-bg to-transparent" />
        <div aria-hidden className="ink-wash pointer-events-none absolute inset-x-0 bottom-0 h-[62%] opacity-90" />
        <span aria-hidden className="stencil pointer-events-none absolute right-6 top-24 hidden text-[210px] leading-none lg:block">
          心
        </span>

        <motion.div
          style={reduced ? undefined : { y: heroTextY, opacity: heroTextOpacity }}
          className="relative mx-auto w-full max-w-[1400px] px-5 pb-9 pt-7 sm:px-8 sm:pb-12 md:pt-32"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-accent-3/20 pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint"
          >
            <span className="text-accent-2">壹 // MOONRISE</span>
            <span className="hidden sm:inline">{site.realm}</span>
            <span className="hidden sm:inline">
              <span className="text-accent-3">●</span> SENTINEL
            </span>
            <span className="hidden md:inline">20.59N 78.96E</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-3"
          >
            {site.brand} // {site.epithet}
          </motion.p>

          <h1 className="bloom mt-3 font-display text-[clamp(62px,13vw,198px)]">
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
            className="mt-8 flex flex-col gap-6 border-t border-accent-3/20 pt-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="max-w-xl">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
                {site.role} // {site.location}
              </p>
              <p className="mt-3 text-pretty text-[16.5px] leading-relaxed text-muted sm:text-[18px]">{site.intro}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
              <span className="inline-flex items-center gap-2">
                <span className={site.available ? 'size-1.5 animate-pulse rounded-full bg-accent-3' : 'size-1.5 rounded-full bg-faint'} />
                {site.available ? 'OPEN TO OPPORTUNITIES' : 'CURRENTLY BOOKED'}
              </span>
              <a href="#work" className="group inline-flex items-center gap-2 text-fg transition-colors hover:text-accent-2">
                ENTER THE WORK
                <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-1" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-accent-3/15 bg-surface/40 py-3 backdrop-blur-sm" aria-hidden>
        <ul className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.26em] text-muted">
          {[...site.marquee, ...site.marquee].map((item, i) => (
            <li key={i} className="flex items-center gap-8">
              <span aria-hidden className="crescent size-1.5 shrink-0 text-accent-2" />
              {item}
              <span className="text-accent-3/60">·</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chapter 貳 — the portfolio itself, straight after the title card. */}
      <section id="work" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-32">
        <SectionHead index="貳" label="SELECTED WORK" jp="作" title="Projects" aside={`${projects.length} STUDIES`} />
        <TiltDeck className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:gap-x-8 lg:gap-y-20">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </TiltDeck>
      </section>

      <PinnedStatement />

      {/* Chapter 肆 — about */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="肆" label="THE DEVELOPER" jp="人" title="Human in the machine" aside="INDIA · OPEN" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="relative border border-accent-3/20 bg-surface/50 p-2">
              <Parallax src={asset('about.svg')} alt="Abstract render" className="aspect-[3/4] max-w-[460px]" strength={6} reveal />
              <span className="absolute left-4 top-4 bg-bg/75 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-accent-2">STUDY · 01</span>
              <span className="absolute bottom-4 right-4 font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">心月狐</span>
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
                className="inline-flex items-center gap-2 border border-line-strong px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent hover:text-accent-2"
              >
                READ THE FULL PROFILE
                <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Chapter 伍 — skills */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="伍" label="TOOLKIT" jp="技" title="Skills & expertise" aside="12 SYSTEMS SYNCED" />
        <Skills />
      </section>

      {/* Chapter 陸 — honours */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-44">
        <SectionHead index="陸" label="RECORD" jp="績" title="Achievements" aside="3 ENTRIES · VERIFIED" />
        <Achievements />
      </section>

      {/* Chapter 柒 — the character showcase closes the page, after all of his
          own work. Scroll drives the framing, so the portrait travels and
          settles instead of just sitting on the page. */}
      <CharacterChapter />
    </>
  )
}

/**
 * The character showcase. Everything is scroll-scrubbed: the portrait opens
 * larger and settles, the moon behind it travels, the caption sheet lifts.
 */
function CharacterChapter() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const portraitScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.16, 1, 1.04])
  const portraitX = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])
  const copyY = useTransform(scrollYProgress, [0, 1], [70, -70])
  const moonY = useTransform(scrollYProgress, [0, 1], ['14%', '-14%'])

  const facts: Array<[string, string]> = [
    ['ELEMENT', characterSheet.element],
    ['WEAPON', characterSheet.weapon],
    ['SIGNATURE', characterSheet.signature],
    ['FORMS', characterSheet.forms.join(' · ')],
  ]

  return (
    <section ref={ref} aria-label="The Moon Fox" className="relative border-b border-accent-3/15 py-20 lg:h-[210vh] lg:py-0">
      {/* Pinned on desktop only: on a phone the copy is taller than the screen,
          so pinning would clip it. Below lg it simply flows. */}
      <div className="relative flex items-center overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        <motion.div style={reduced ? undefined : { y: moonY }} aria-hidden className="moon-disc absolute -right-[14%] top-1/2 hidden size-[62vmin] -translate-y-1/2 opacity-30 blur-[2px] lg:block" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_20%_50%,rgba(216,52,47,0.14),transparent_70%)]" />
        {/* The key art runs behind this chapter now, so the caption sheet gets
            its own scrim: downwards on phones, left-to-right on desktop where
            the copy sits beside the portrait. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,7,0.12)_0%,rgba(10,6,7,0.55)_42%,rgba(10,6,7,0.94)_100%)] lg:bg-[linear-gradient(90deg,rgba(10,6,7,0.25)_0%,rgba(10,6,7,0.8)_52%,rgba(10,6,7,0.95)_100%)]"
        />

        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div style={reduced ? undefined : { scale: portraitScale, x: portraitX }} className="relative">
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:mx-0 lg:max-w-[380px]">
              <div aria-hidden className="moon-disc absolute -inset-4 opacity-25 blur-lg" />
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] border border-accent-3/30 bg-bg/70">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(216,52,47,0.3),transparent_62%)]" />
                <div aria-hidden className="absolute inset-4 rounded-t-[999px] border border-accent-2/15" />
                <img
                  src={BACKGROUND_STILL}
                  alt="Hsin, the Moon Fox"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                  style={{ objectPosition: '50% 42%' }}
                  onError={(event) => {
                    // No key art uploaded: fade out so the framed moon behind
                    // stands in as a deliberate composition.
                    event.currentTarget.style.opacity = '0'
                  }}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent opacity-90" />
                <span className="absolute left-5 top-7 font-mono text-[8.5px] uppercase tracking-[0.26em] text-accent-2">心月狐</span>
                <span className="absolute bottom-5 left-5 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint">KEY ART · SENTINEL</span>
              </div>
              <span aria-hidden className="absolute -bottom-3 left-1/2 size-6 -translate-x-1/2 rotate-45 border border-accent-3/40 bg-bg" />
            </div>
          </motion.div>

          <motion.div style={reduced ? undefined : { y: copyY }} className="relative">
            <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.26em] text-faint">
              <span className="text-accent">柒</span>
              <span className="crescent size-2.5 text-accent-2" />
              <span>THE MOON FOX</span>
              <span className="jp text-[11px] normal-case tracking-[0.14em] text-muted">月華</span>
            </div>

            <h2 className="mt-5 font-display text-[clamp(52px,8vw,110px)] leading-[0.9]">
              {characterSheet.roman}
              <span className="ml-4 align-middle text-[0.42em] tracking-[0.2em] text-accent-2">{characterSheet.name}</span>
            </h2>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent-3">{characterSheet.title}</p>
            <p className="mt-6 max-w-lg text-pretty text-[16px] leading-relaxed text-muted">{characterSheet.line}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-accent-3/25 pt-6">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-faint">{label}</dt>
                  <dd className="mt-1.5 text-[14px] text-fg">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 max-w-lg font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.18em] text-faint">
              Visual direction only — the portfolio below is Jay&apos;s own work.
            </p>

            <div className="mt-7 flex items-center gap-3 font-mono text-[8.5px] uppercase tracking-[0.2em] text-faint">
              <span className="h-px w-10 bg-accent-3/50" />
              <span className="animate-pulse">↓</span> SAY HELLO
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SectionHead({ index, label, jp, title, aside }: { index: string; label: string; jp: string; title: string; aside?: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
        <span className="stencil text-[26px] leading-none">{index}</span>
        <span aria-hidden className="crescent size-2.5 text-accent-2" />
        <span className="h-px w-8 bg-accent" />
        <span>{label}</span>
        <span className="jp text-[11px] normal-case tracking-[0.12em] text-muted">{jp}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="hidden text-accent-3 sm:inline">{site.character} · {site.realm}</span>
          <span aria-hidden className="seal size-6 text-[13px] leading-none">
            心
          </span>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
        <Lines as="h2" className="font-display text-[42px] sm:text-[60px]" lines={[title]} />
        {aside && <Reveal className="pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">{aside}</Reveal>}
      </div>
    </div>
  )
}

function Skills() {
  return (
    <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {skillGroups.map((group, groupIndex) => (
        <Reveal key={group.title} delay={groupIndex * 0.05}>
          <h3 className="border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-accent-3">{group.title}</h3>
          <ul className="mt-6 flex flex-col gap-5">
            {group.items.map((skill) => (
              <li key={skill.name}>
                <div className="flex items-baseline justify-between gap-3 text-[14px]">
                  <span>{skill.name}</span>
                  <span className="font-mono text-[9.5px] tabular-nums text-faint">{skill.level}%</span>
                </div>
                <div className="mt-2 h-[4px] w-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                    transition={{ duration: 1.1, delay: 0.1, ease }}
                    className="h-full bg-gradient-to-r from-accent to-accent-3"
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
                'group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden border p-7 backdrop-blur-sm sm:p-9 md:min-h-0',
                featured
                  ? 'border-accent/40 bg-[radial-gradient(130%_140%_at_100%_0%,rgba(216,52,47,0.3),rgba(21,13,15,0.88)_62%)]'
                  : 'panel hover:border-accent-3/50',
              )}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] rule-tick opacity-80" />
              <div className="relative flex items-center justify-between gap-4">
                <span className={cx('grid size-12 place-items-center border', featured ? 'border-transparent bg-accent text-fg' : 'border-accent-3/40 text-accent-2')}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-right font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint">
                  {featured ? 'FIRST' : `ENTRY 0${i + 1}`} · {achievement.tag}
                </span>
              </div>

              <span
                aria-hidden
                className={cx('font-display pointer-events-none absolute -bottom-8 right-3 select-none leading-none', featured ? 'text-[190px] text-accent/25' : 'text-[120px] text-fg/[0.05]')}
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
