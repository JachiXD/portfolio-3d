import { useEffect, useRef } from 'react'

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  alpha: number
  drift: number
}

/**
 * Night rain over the key art.
 *
 * One canvas, one draw loop: the drops fall in front of Hsin but behind every
 * word on the page, so the artwork still reads. Pale moon-ivory streaks, a
 * slight wind lean, a thin frame budget (the loop pauses with the tab and caps
 * the device pixel ratio), and under reduced motion it paints a single still
 * frame instead of animating.
 *
 * The page moving makes the weather answer: while the visitor scrolls the
 * streaks fall faster and brighter, and once they stop it eases back to the
 * quiet baseline over about a second.
 */
export function Rain({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let drops: Drop[] = []
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let lastScroll = window.scrollY
    let gust = 0

    const between = (min: number, max: number) => min + Math.random() * (max - min)

    const make = (spread: boolean): Drop => ({
      x: between(-0.1 * width, 1.1 * width),
      y: spread ? between(-height, height) : between(-height * 0.3, 0),
      len: between(11, 30),
      speed: between(380, 880),
      alpha: between(0.09, 0.3),
      drift: between(2, 8),
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      const count = Math.round((width < 640 ? 95 : 190) * density)
      drops = Array.from({ length: count }, () => make(true))
    }

    const paint = (delta: number | null) => {
      ctx.clearRect(0, 0, width, height)
      // One multiplier for both: a gust quickens the fall and lifts the streaks
      // toward full brightness, never past it.
      const speedScale = 1 + gust * 1.1
      const alphaScale = 1 + gust * 0.9
      for (const drop of drops) {
        if (delta !== null) {
          drop.y += drop.speed * speedScale * delta
          drop.x += drop.drift * delta * 8
          if (drop.y - drop.len > height) {
            const next = make(false)
            drop.x = next.x
            drop.y = next.y
            drop.len = next.len
            drop.speed = next.speed
            drop.alpha = next.alpha
            drop.drift = next.drift
          }
        }
        ctx.strokeStyle = `rgba(248, 239, 228, ${Math.min(1, drop.alpha * alphaScale)})`
        ctx.lineWidth = 1 + gust * 0.35
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x - drop.drift, drop.y + drop.len)
        ctx.stroke()
      }
    }

    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0.016
      previous = now

      // How far the page travelled this frame, normalised into a 0..1 gust.
      const scroll = window.scrollY
      const travelled = Math.abs(scroll - lastScroll)
      lastScroll = scroll
      const target = Math.min(travelled / 90, 1)
      // Rise quickly while moving, fall away gently once the page is still:
      // the two time constants are what make it feel like weather, not a toggle.
      const response = target > gust ? 12 : 2.6
      gust += (target - gust) * (1 - Math.exp(-response * delta))
      if (gust < 0.002) gust = 0

      paint(delta)
      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame || reduced.matches) return
      previous = 0
      lastScroll = window.scrollY
      frame = window.requestAnimationFrame(tick)
    }

    const stop = () => {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const onVisibility = () => (document.hidden ? stop() : start())
    const onMotion = () => {
      if (reduced.matches) {
        stop()
        gust = 0
        paint(null)
      } else {
        start()
      }
    }

    resize()
    paint(null)
    start()

    const observer = new ResizeObserver(() => {
      resize()
      if (reduced.matches) paint(null)
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', onMotion)

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onMotion)
    }
  }, [density])

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
}
