import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { site } from '../../data/site'
import { cx } from '../lib/cx'

export function useLocalTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: site.timezone }).format(new Date()))
    tick()
    const id = window.setInterval(tick, 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

export function Nav() {
  const time = useLocalTime()
  const location = useLocation()
  const [hidden, setHidden] = useState(false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > last && y > 120)
      setLifted(y > 40)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const workActive = location.pathname === '/' || location.pathname.startsWith('/work')
  const aboutActive = location.pathname.startsWith('/about')

  const link = (to: string, label: string, code: string, active: boolean) => (
    <NavLink
      key={to}
      to={to}
      className={cx(
        'group inline-flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
        active ? 'text-accent' : 'text-muted hover:text-fg',
      )}
    >
      <span className={cx('text-[8px]', active ? 'text-accent-2' : 'text-faint')}>{code}</span>
      {label}
    </NavLink>
  )

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        lifted ? 'border-line bg-bg/90 backdrop-blur-xl' : 'border-transparent bg-transparent',
        hidden && '-translate-y-full',
      )}
    >
      <div aria-hidden className="h-[3px] hazard-strip opacity-90" />
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="notch-sm grid size-8 place-items-center bg-accent font-display text-[18px] leading-none text-black">J</span>
          <span className="leading-none">
            <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-fg">{site.brand}</span>
            <span className="mt-1.5 hidden font-mono text-[8px] uppercase tracking-[0.22em] text-faint sm:block">{site.unit} // PILOT FILE</span>
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {link('/#work', 'WORK', '01', workActive)}
          {link('/about', 'ABOUT', '02', aboutActive)}
          <a
            href={`mailto:${site.email}`}
            className="notch-sm hidden border border-accent px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-black sm:inline-block"
          >
            CONTACT // 03
          </a>
          <span className="hidden items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.18em] text-faint lg:flex">
            <span className="size-1 animate-pulse bg-accent-2" />
            {site.location} {time}
          </span>
        </nav>
      </div>
    </header>
  )
}
