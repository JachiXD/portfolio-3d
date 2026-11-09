import { ArrowUpRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { site } from '../../data/site'
import { Lines, Magnetic, Reveal } from './motion'
import { useLocalTime } from './Nav'

// The GitHub Pages build is static, so the contact form hands the message to
// the visitor's mail client instead of posting to the Worker.
const staticHost = import.meta.env.MODE === 'pages'

export function Footer() {
  const time = useLocalTime()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (staticHost) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`)
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`)
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
      setState('done')
      return
    }
    setState('sending')
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) })
    if (response.ok) setState('done')
    else {
      setState('error')
      setError(((await response.json()) as { error?: string }).error ?? 'Something went wrong.')
    }
  }

  const field =
    'h-14 w-full border border-line-strong bg-black/30 px-4 font-mono text-[12px] uppercase tracking-[0.1em] placeholder:text-faint placeholder:uppercase placeholder:tracking-[0.14em] transition-colors focus:border-accent focus:outline-none'

  return (
    <footer id="contact" className="mt-32 border-t border-line sm:mt-44">
      <div aria-hidden className="h-2 hazard-strip opacity-80" />
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
          <span className="text-accent">CONTACT // NERV</span>
          <span className="jp text-[11px] tracking-[0.12em] text-muted">連絡</span>
          <span className="text-accent-2">● CHANNEL OPEN</span>
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <Lines
              as="h2"
              className="font-display text-[clamp(46px,7.5vw,110px)]"
              lines={['Let’s build', <>something that <span className="text-accent">thinks</span></>]}
            />
            <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Magnetic>
                <a
                  href={`mailto:${site.email}`}
                  className="notch-sm inline-flex h-14 items-center gap-2 bg-accent px-7 font-mono text-[10.5px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-accent-2"
                >
                  {site.email}
                  <ArrowUpRight className="size-4" />
                </a>
              </Magnetic>
              <p className="max-w-[240px] font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.16em] text-muted">
                {site.available ? 'OPEN TO INTERNSHIPS, COLLABORATIONS AND INTERESTING PROBLEMS' : 'FULLY BOOKED AT THE MOMENT'}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            {state === 'done' ? (
              <div className="flex h-full min-h-[320px] flex-col justify-center border border-accent-2/40 bg-surface p-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-2">● TRANSMISSION RECEIVED</p>
                <p className="font-display mt-3 text-[38px]">Thank you</p>
                <p className="mt-2 text-[14px] text-muted">I read everything myself and reply within two days.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">TRANSMISSION FORM // 03</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required placeholder="NAME" className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input required type="email" placeholder="EMAIL" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <textarea
                  required
                  placeholder="PROJECT BRIEF"
                  className={`${field} h-auto min-h-[140px] resize-none py-4`}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="notch-sm inline-flex h-14 items-center justify-center gap-2 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-[0.24em] text-accent transition-colors hover:bg-accent hover:text-black disabled:opacity-50"
                >
                  TRANSMIT
                  <ArrowUpRight className="size-3.5" />
                </button>
                {state === 'error' && <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-alert">{error}</p>}
              </form>
            )}
          </Reveal>
        </div>

        <div className="mt-24 grid gap-6 border-t border-line pt-6 font-mono text-[9px] uppercase tracking-[0.16em] sm:grid-cols-3">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="text-muted transition-colors hover:text-accent">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-faint sm:text-center">
            {site.location} // {time}
          </p>
          <p className="text-faint sm:text-right">
            © {new Date().getFullYear()} {site.name} // {site.brand}
          </p>
        </div>
      </div>
    </footer>
  )
}
