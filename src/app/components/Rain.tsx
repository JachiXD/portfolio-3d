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
      for (const drop of drops) {
        if (delta !== null) {
          drop.y += drop.speed * delta
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
        ctx.strokeStyle = `rgba(248, 239, 228, ${drop.alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x - drop.drift, drop.y + drop.len)
        ctx.stroke()
      }
    }

    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0.016
      previous = now
      paint(delta)
      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame || reduced.matches) return
      previous = 0
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
