import { AnimatePresence, animate, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { characterSheet, site } from '../../data/site'
import { BACKGROUND_STILL } from './WorldBackground'

// A short title sequence on first visit per tab: her key art rises behind the
// name and the counter, then the whole frame fades and blurs away. Everything
// is skipped when the user prefers reduced motion.
export function Preloader() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return !sessionStorage.getItem('preloaded')
  })
  const [count, setCount] = useState(0)
  const [artReady, setArtReady] = useState(false)

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    const controls = animate(0, 100, { duration: 1.1, ease: [0.4, 0, 0.2, 1], onUpdate: (v) => setCount(Math.round(v)) })
    // The clock is what ends the sequence, never the image: a slow or cached
    // decode can delay the art, but it can never strand the visitor here.
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
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-bg p-6 text-fg sm:p-10"
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* The uploaded key art, full bleed and cropped by object-cover so it
              never distorts. It opens from a slight push-in and fades up once
              the browser has actually decoded it. */}
          <motion.div
            aria-hidden
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={BACKGROUND_STILL}
              alt=""
              fetchPriority="high"
              decoding="async"
              onLoad={() => setArtReady(true)}
              className={`absolute inset-0 size-full object-cover object-[52%_26%] transition-opacity duration-[1200ms] sm:object-[50%_30%] ${
                artReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </motion.div>

          {/* Legibility scrim: darker at the top and bottom on phones, and a
              left-to-right sweep on desktop where the counter sits. */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,7,0.8)_0%,rgba(10,6,7,0.12)_32%,rgba(10,6,7,0.58)_72%,#0a0607_100%)] lg:bg-[linear-gradient(95deg,rgba(10,6,7,0.93)_0%,rgba(10,6,7,0.6)_42%,rgba(10,6,7,0.22)_72%,rgba(10,6,7,0.5)_100%)]" />
          <div aria-hidden className="ink-wash absolute inset-0 opacity-40" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

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
              <p className="font-display tabular-nums text-[clamp(96px,22vw,240px)] leading-none drop-shadow-[0_2px_30px_rgba(10,6,7,0.85)]">{count}</p>
              <span className="mb-4 font-mono text-[18px] text-accent-3">%</span>
            </div>
            <div className="mt-6 h-px w-full max-w-xl bg-line/80">
              <div className="h-full bg-gradient-to-r from-accent to-accent-3 transition-[width] duration-75" style={{ width: `${count}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              RESONANCE STEADY
            </div>
          </div>

          <footer className="relative flex items-end justify-between gap-6 border-t border-accent-3/25 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            <p>{site.name} // AI &amp; ML</p>
            <p className="hidden sm:block">{characterSheet.name} · KEY ART</p>
            <p className="text-accent-2">● ARRIVING</p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
