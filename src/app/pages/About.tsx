import { ArrowUpRight } from 'lucide-react'

import { goals, site } from '../../data/site'
import { Lines, Parallax, Reveal } from '../components/motion'

export function About() {
  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-36">
      <Lines as="h1" className="font-display text-balance text-[clamp(44px,7.5vw,112px)]" lines={['AI & ML developer,', 'web builder, CBSE winner']} />
      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <Reveal>
          <Parallax src="/images/about.svg" alt="Abstract render" className="aspect-[3/4] rounded-image" strength={6} />
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="link-draw inline-flex items-center gap-1 text-muted hover:text-fg">
                  {s.label}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <div>
          <Reveal className="text-pretty text-[19px] leading-relaxed sm:text-[22px]">
            <p>
              I am a developer with a deep love for coding and artificial intelligence. My journey so far includes first place in CBSE competitions for an AI chatbot and machine-learning projects, and the work I enjoy most is making intelligent things that people can actually use.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-5 text-[17px] leading-relaxed text-muted">
            <p>
              My expertise spans web development, AI implementation and user-friendly interfaces. I am particularly interested in how AI can be used to create better experiences and solve real-world problems, rather than just demonstrate that a model works.
            </p>
            <p>
              The goal is to combine technical skill with a genuine interest in the problem, and to keep shipping things that are more useful than they are impressive. I like short feedback loops, real data, and launching before it is perfect.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-16">
            <h2 className="text-[14px] text-muted">Career goals</h2>
            <div className="mt-4 grid gap-x-10 gap-y-8 border-t border-line pt-6 sm:grid-cols-2">
              {goals.map((group) => (
                <div key={group.horizon}>
                  <h3 className="text-[12px] uppercase tracking-[0.18em] text-accent">{group.horizon}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5 text-[15px] leading-relaxed text-muted">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden className="mt-[0.55em] size-1 shrink-0 rounded-full bg-faint" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-16 grid grid-cols-3 gap-6">
            {[
              ['1st', 'CBSE competition'],
              ['2', 'featured projects'],
              ['12', 'tools in the stack'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-[52px] leading-none sm:text-[72px]">{value}</p>
                <p className="mt-2 text-[14px] text-muted">{label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </article>
  )
}
