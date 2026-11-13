import { AnimatePresence, animate, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { characterSheet, site } from '../../data/site'

// A short title sequence on first visit per tab: the moon rises, the name
// resolves. Everything is skipped when the user prefers reduced motion.
export function Preloader() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return !sessionStorage.getItem('preloaded')
  })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    const controls = animate(0, 100, { duration: 1.1, ease: [0.4, 0, 0.2, 1], onUpdate: (v) => setCount(Math.round(v)) })
    const timer = window.setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('preloaded', '1')
    }, 1500)
    return () => {
      controls.stop()
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#0a0607] p-6 text-fg sm:p-10"
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div aria-hidden className="moon-disc absolute -right-[10%] top-[8%] size-[58vmin] opacity-60 blur-[1px]" />
          <div aria-hidden className="ink-wash absolute inset-0 opacity-80" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_20%,transparent,rgba(10,6,7,0.82)_70%)]" />

          <header className="relative flex items-start justify-between gap-6 border-b border-accent-3/25 pb-4 font-mono text-[10px] uppercase tracking-[0.18em]">
            <div>
              <p className="text-accent-2">{characterSheet.name} · MOON FOX</p>
              <p className="mt-1.5 text-fg/80">{site.brand}</p>
            </div>
            <div className="text-right">
              <p className="jp text-[12px] text-muted">月華</p>
              <p className="mt-1.5 text-accent-3">SENTINEL OF {site.realm}</p>
            </div>
          </header>

          <div className="relative flex flex-1 flex-col justify-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
              MOONRISE // ENTERING MENGZHOU
            </motion.p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-display tabular-nums text-[clamp(110px,24vw,260px)] leading-none">{count}</p>
              <span className="mb-4 font-mono text-[18px] text-accent-3">%</span>
            </div>
            <div className="mt-6 h-px w-full max-w-xl bg-line">
              <div className="h-full bg-gradient-to-r from-accent to-accent-3 transition-[width] duration-75" style={{ width: `${count}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              RESONANCE STEADY
            </div>
          </div>

          <footer className="relative flex items-end justify-between gap-6 border-t border-accent-3/25 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            <p>
              {site.name} // AI &amp; ML
            </p>
            <p className="hidden sm:block">INDIA · 20.59N 78.96E</p>
            <p className="text-accent-2">● ARRIVING</p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
