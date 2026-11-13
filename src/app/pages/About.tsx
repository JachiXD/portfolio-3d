import { ArrowUpRight } from 'lucide-react'

import { asset, goals, site } from '../../data/site'
import { Lines, Parallax, Reveal } from '../components/motion'

export function About() {
  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-36">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
        <span className="text-accent-2">PROFILE · 01</span>
        <span>
          SUBJECT: <span className="text-fg">JAY TAKLE</span>
        </span>
        <span className="text-accent-3">● {site.location}</span>
      </div>

      <Lines
        as="h1"
        className="font-display mt-10 text-balance text-[clamp(42px,7vw,104px)]"
        lines={['AI & ML developer,', 'web builder, CBSE winner']}
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <Reveal>
          <div className="relative border border-line bg-surface/60 p-2 backdrop-blur-sm">
            <Parallax src={asset('about.svg')} alt="Abstract render" className="aspect-[3/4]" strength={6} reveal />
            <span className="absolute left-4 top-4 bg-bg/75 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-accent-2">STUDY · SUBJECT</span>
            <span className="absolute bottom-4 right-4 font-mono text-[8.5px] uppercase tracking-[0.2em] text-faint">心月狐</span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.16em]">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent-2">
                  {s.label}
                  <ArrowUpRight className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <div>
          <Reveal className="border-l-2 border-accent pl-5 text-pretty text-[18px] leading-relaxed sm:text-[21px]">
            <p>
              I am a developer with a deep love for coding and artificial intelligence. My journey so far includes first place in CBSE competitions for an AI chatbot and machine-learning projects, and the work I enjoy most is making intelligent things that people can actually use.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-5 text-[16.5px] leading-relaxed text-muted">
            <p>
              My expertise spans web development, AI implementation and user-friendly interfaces. I am particularly interested in how AI can be used to create better experiences and solve real-world problems, rather than just demonstrate that a model works.
            </p>
            <p>
              The goal is to combine technical skill with a genuine interest in the problem, and to keep shipping things that are more useful than they are impressive. I like short feedback loops, real data, and launching before it is perfect.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-16">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
              <span>
                <span className="text-accent">貳</span> // CAREER GOALS
              </span>
              <span className="jp text-[11px] tracking-[0.12em] text-muted">目標</span>
            </div>
            <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {goals.map((group) => (
                <div key={group.horizon}>
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-3">{group.horizon}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px] leading-relaxed text-muted">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-16 grid grid-cols-3 border border-line bg-surface/50 backdrop-blur-sm">
            {[
              ['1ST', 'CBSE COMPETITION'],
              ['02', 'FEATURED PROJECTS'],
              ['12', 'TOOLS IN THE STACK'],
            ].map(([value, label], i) => (
              <div key={label} className={i === 0 ? 'plate-ivory border-l border-line p-4 first:border-l-0 sm:p-6' : 'border-l border-line p-4 first:border-l-0 sm:p-6'}>
                <p className="font-display text-[44px] leading-none sm:text-[60px]">{value}</p>
                <p className={i === 0 ? 'mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-bg/70' : 'mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-muted'}>
                  {label}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </article>
  )
}
