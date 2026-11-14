import { useEffect, useRef } from 'react'

interface Mote {
  kind: 'streak' | 'bead'
  x: number
  y: number
  len: number
  radius: number
  speed: number
  alpha: number
}

/**
 * Night rain over the key art.
 *
 * One canvas, one draw loop: the weather falls in front of Hsin but behind
 * every word on the page, so the artwork still reads. Two kinds of water,
 * both falling straight down: thin ivory streaks for the rain itself, and a
 * slower scatter of round beads that cling and slide like droplets on glass.
 *
 * A thin frame budget — the loop pauses with the tab, caps the device pixel
 * ratio, and paints a single still frame under reduced motion. While the page
 * is moving the fall quickens and brightens, then eases back once it stops.
 */
export function Rain({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motes: Mote[] = []
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let lastScroll = window.scrollY
    let gust = 0

    const between = (min: number, max: number) => min + Math.random() * (max - min)

    const rain = (): Mote => ({
      kind: 'streak',
      x: between(0, width),
      y: between(-height * 0.3, 0),
      len: between(14, 34),
      radius: 0,
      speed: between(420, 900),
      alpha: between(0.1, 0.32),
    })

    // Beads travel far slower than the rain, the way a droplet catches on
    // glass and only gives way every second or two.
    const bead = (spread: boolean): Mote => ({
      kind: 'bead',
      x: between(0, width),
      y: spread ? between(0, height) : between(-40, 0),
      len: 0,
      radius: between(1.4, 3.4),
      speed: between(26, 82),
      alpha: between(0.16, 0.42),
    })

    const respawn = (mote: Mote) => {
      const next = mote.kind === 'bead' ? bead(false) : rain()
      mote.x = next.x
      mote.y = next.y
      mote.len = next.len
      mote.radius = next.radius
      mote.speed = next.speed
      mote.alpha = next.alpha
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      const streaks = Math.round((width < 640 ? 80 : 165) * density)
      const beads = Math.round((width < 640 ? 18 : 34) * density)
      motes = [...Array.from({ length: streaks }, rain), ...Array.from({ length: beads }, () => bead(true))]
    }

    const paint = (delta: number | null) => {
      ctx.clearRect(0, 0, width, height)
      // One gust, two scales: the rain answers it strongly, the beads only drift
      // a little faster, so the glass never loses its calm.
      const fast = 1 + gust * 1.1
      const lift = 1 + gust * 0.9

      for (const mote of motes) {
        if (delta !== null) {
          mote.y += mote.speed * (mote.kind === 'bead' ? 1 + gust * 0.35 : fast) * delta
          if (mote.y - mote.len > height) respawn(mote)
        }

        if (mote.kind === 'bead') {
          if (mote.y - mote.radius < 0) continue
          // A bead of water: soft body, bright inner highlight, faint rim.
          ctx.fillStyle = `rgba(248, 239, 228, ${Math.min(1, mote.alpha * 0.5 * lift)})`
          ctx.beginPath()
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(255, 252, 246, ${Math.min(1, mote.alpha * 1.5 * lift)})`
          ctx.beginPath()
          ctx.arc(mote.x - mote.radius * 0.3, mote.y - mote.radius * 0.34, mote.radius * 0.36, 0, Math.PI * 2)
          ctx.fill()
          continue
        }

        // Straight down: same x for both ends of the stroke, no lean.
        ctx.strokeStyle = `rgba(248, 239, 228, ${Math.min(1, mote.alpha * lift)})`
        ctx.lineWidth = 1 + gust * 0.35
        ctx.beginPath()
        ctx.moveTo(mote.x, mote.y)
        ctx.lineTo(mote.x, mote.y + mote.len)
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
