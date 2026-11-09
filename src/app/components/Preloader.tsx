import { AnimatePresence, animate, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { site } from '../../data/site'

// A short MAGI boot sequence on first visit per tab. Everything is skipped
// when the user prefers reduced motion.
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
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#050509] p-6 text-fg sm:p-10"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div aria-hidden className="grid-bg absolute inset-0 opacity-50" />
          <div aria-hidden className="scanlines absolute inset-0 opacity-30" />

          <header className="relative flex items-start justify-between gap-6 border-b border-line pb-4 font-mono text-[10px] uppercase tracking-[0.18em]">
            <div>
              <p className="text-accent">NERV // CENTRAL DOGMA</p>
              <p className="mt-1.5 text-fg">{site.brand}</p>
            </div>
            <div className="text-right">
              <p className="jp text-[12px] text-muted">起動シーケンス</p>
              <p className="mt-1.5 text-accent-2">MAGI SYSTEM</p>
            </div>
          </header>

          <div className="relative flex flex-1 flex-col justify-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
              SYNC TEST // UNIT 01
            </motion.p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-display tabular-nums text-[clamp(110px,24vw,260px)] leading-none">{count}</p>
              <span className="mb-4 font-mono text-[18px] text-accent">%</span>
            </div>
            <div className="mt-6 h-[6px] w-full max-w-xl bg-line">
              <div className="h-full bg-accent transition-[width] duration-75" style={{ width: `${count}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span className="size-1.5 animate-pulse bg-accent-2" />
              PATTERN: BLUE // ALL SYSTEMS NOMINAL
            </div>
          </div>

          <footer className="relative flex items-end justify-between gap-6 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            <p>{site.name} // AI &amp; ML</p>
            <p className="hidden sm:block">TOKYO-3 / INDIA NODE</p>
            <p className="text-accent-2">● ONLINE</p>
          </footer>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
