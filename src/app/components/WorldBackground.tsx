import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

// Everything the background needs lives in `public/media/`. Dropping a file in
// with one of these names is the whole setup:
//
//   hsin-background.jpg  (or .webp)  the still, used as soon as it exists
//   hsin-background.webm            optional, preferred video source
//   hsin-background.mp4             optional, fallback video source
//
// Nothing else has to change, and the page is complete without any of them.
const MEDIA = `${import.meta.env.BASE_URL}media/`
export const BACKGROUND_STILL = `${MEDIA}hsin-background.jpg`
const STILL = BACKGROUND_STILL
const STILL_ALT = `${MEDIA}hsin-background.webp`
const VIDEO_WEBM = `${MEDIA}hsin-background.webm`
const VIDEO_MP4 = `${MEDIA}hsin-background.mp4`

type Still = 'probing' | 'ready' | 'missing'

/** True if the browser can decode the file, so a 404 does not leave a hole. */
function useStill() {
  const [still, setStill] = useState<Still>('probing')
  useEffect(() => {
    let live = true
    const probe = (src: string, fallback?: string) => {
      const image = new Image()
      image.onload = () => live && setStill('ready')
      image.onerror = () => {
        if (!live) return
        if (fallback) probe(fallback)
        else setStill('missing')
      }
      image.src = src
    }
    probe(STILL, STILL_ALT)
    return () => {
      live = false
    }
  }, [])
  return still
}

/** A few leaves and lantern motes, drifting on pure CSS. */
function Atmosphere({ density }: { density: number }) {
  const leaves = Array.from({ length: density }, (_, i) => {
    // Deterministic scatter: no layout thrash, no hydration mismatch.
    const seed = (i * 9301 + 49297) % 233280
    const r = seed / 233280
    const r2 = ((i * 4703 + 7919) % 1000) / 1000
    return {
      left: `${Math.round(r * 96)}%`,
      opacity: 0.18 + r2 * 0.34,
      duration: 17 + r * 16,
      delay: -r2 * 24,
      scale: 0.6 + r2 * 0.9,
      tint: i % 5 === 0 ? 'var(--color-accent-3)' : i % 3 === 0 ? 'var(--color-accent-2)' : 'var(--color-accent)',
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {leaves.map((leaf, i) => (
        <span
          key={i}
          aria-hidden
          className="petal"
          style={
            {
              left: leaf.left,
              opacity: leaf.opacity,
              scale: leaf.scale,
              background: leaf.tint,
              '--dur': `${leaf.duration}s`,
              '--delay': `${leaf.delay}s`,
              '--petal-opacity': leaf.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/**
 * The designed fallback: a moon over lacquer, used until a still or video is
 * dropped into `public/media/`. It is not a placeholder box — the site looks
 * finished without any upload at all.
 */
function FallbackScene() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_18%,#2a1416_0%,#160d0f_46%,#0a0607_100%)]" />
      <div className="moon-disc absolute -right-[12%] top-[6%] size-[62vmin] max-h-[720px] max-w-[720px] opacity-80 blur-[1px] md:right-[4%]" />
      <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(216,52,47,0.22),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-bg via-bg/70 to-transparent" />
      <div aria-hidden className="absolute left-[-10%] top-[18%] h-[42vh] w-[70vw] -rotate-12 rounded-full bg-[radial-gradient(closest-side,rgba(216,52,47,0.28),transparent_72%)] blur-3xl" />
    </div>
  )
}

/**
 * The world behind the portfolio.
 *
 * A fixed, pointer-events-free layer: the still (or video, when one exists),
 * a scroll-linked drift and zoom, a warm scrim for legibility, and drifting
 * leaves. The scroll work is a single spring shared by every layer, so it
 * stays cheap on a phone.
 */
export function WorldBackground({ overlay = 0.62 }: { overlay?: number }) {
  const reduced = useReducedMotion()
  const still = useStill()
  const [stillFailed, setStillFailed] = useState(false)
  const [video, setVideo] = useState(false)
  const [coarse, setCoarse] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.35 })

  // Gentle camera drift: the world moves a little slower than the page, and
  // pushes in as it scrolls, so every section reads as a different framing.
  const y = useTransform(smooth, [0, 1], ['0%', '-5%'])
  const scale = useTransform(smooth, [0, 1], [1.03, 1.16])
  const veil = useTransform(smooth, [0, 0.45, 1], [0.88, 0.56, 0.54])

  // Scroll-scrubbed video, when a video exists and motion is welcome. With no
  // video the handler is inert, so this never costs anything today.
  useMotionValueEvent(smooth, 'change', (progress) => {
    const element = videoRef.current
    if (!element) return
    const duration = element.duration
    if (!Number.isFinite(duration) || duration <= 0) return
    const target = progress * duration
    if (Math.abs(element.currentTime - target) > 0.12) element.currentTime = target
  })

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Keep a scrubbed video paused; a looping one is allowed to play.
  const scrub = video && !reduced && !coarse
  useEffect(() => {
    const element = videoRef.current
    if (!element) return
    if (scrub) element.pause()
    else void element.play().catch(() => undefined)
  }, [scrub, video])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <motion.div style={reduced ? undefined : { y, scale }} className="absolute inset-0">
        <video
          ref={videoRef}
          className={video ? 'absolute inset-0 size-full object-cover' : 'hidden'}
          style={{ objectPosition: 'var(--bg-pos)' }}
          autoPlay={!scrub}
          muted
          loop
          playsInline
          preload="metadata"
          poster={STILL}
          onCanPlay={() => setVideo(true)}
          onError={() => setVideo(false)}
        >
          <source src={VIDEO_WEBM} type="video/webm" />
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>

        {still === 'ready' && !stillFailed && (
          <img
            src={STILL}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: 'var(--bg-pos)' }}
            onError={() => setStillFailed(true)}
          />
        )}

        {(still !== 'ready' || stillFailed) && !video && <FallbackScene />}
      </motion.div>

      {/* Readability scrim: warm, heavier at the bottom where the type sits. */}
      <motion.div
        style={reduced ? { opacity: overlay } : { opacity: veil }}
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,7,0.42)_0%,rgba(10,6,7,0.12)_38%,rgba(10,6,7,0.52)_82%,#0a0607_100%)]"
      />
      <div className="ink-wash absolute inset-0 opacity-35" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg/70 to-transparent" />

      {!reduced && <Atmosphere density={coarse ? 7 : 16} />}
    </div>
  )
}
