/**
 * Screen tilt for page sections: the phone's gyroscope on touch devices, the
 * cursor on a mouse, never both.
 *
 * One module-level loop owns the listeners and the smoothing, so every section
 * that subscribes shares a single rAF and a single set of sensors. The hero
 * sculpture keeps its own hook, because it has to negotiate the iOS permission
 * prompt; this store is the read-only version for sections that only need the
 * current lean.
 */
export interface TiltReading {
  x: number
  y: number
}

type Listener = (tilt: TiltReading) => void

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const listeners = new Set<Listener>()
const value: TiltReading = { x: 0, y: 0 }
const base: TiltReading = { x: 0, y: 0 }
const gyro: TiltReading = { x: 0, y: 0 }
let compass: number | null = null
let frame = 0
let previous = 0
let detach: (() => void) | null = null

/** Screen rotation, so a landscape lean still maps onto the right axis. */
function screenAngle() {
  const angle = typeof screen !== 'undefined' ? screen.orientation?.angle : 0
  return typeof angle === 'number' ? angle : 0
}

/** Shortest way round the compass, so 359° → 1° does not swing the scene. */
function wrapDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180
}

function tick(now: number) {
  const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0.016
  previous = now
  const decay = Math.exp(-3.4 * dt)
  gyro.x *= decay
  gyro.y *= decay
  const goalX = clamp(base.x + gyro.x / 48, -1, 1)
  const goalY = clamp(base.y + gyro.y / 48, -1, 1)
  const k = 1 - Math.exp(-9 * dt)
  value.x += (goalX - value.x) * k
  value.y += (goalY - value.y) * k
  for (const listener of listeners) listener(value)
  frame = requestAnimationFrame(tick)
}

function attach() {
  if (detach) return
  const fine = window.matchMedia('(pointer: fine)').matches
  const cleanups: Array<() => void> = []

  const onPointer = (event: PointerEvent) => {
    base.x = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1)
    base.y = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1)
  }

  const onOrientation = (event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event
    if (beta == null || gamma == null) return
    const rad = (screenAngle() * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const roll = gamma * cos - (beta - 90) * sin
    const pitch = gamma * sin + (beta - 90) * cos
    let yaw = 0
    if (alpha != null) {
      if (compass == null) compass = alpha
      const delta = wrapDegrees(alpha - compass)
      compass += delta * 0.004
      yaw = clamp(delta / 70, -0.45, 0.45)
    }
    base.x += (clamp(roll / 21 + yaw, -1, 1) - base.x) * 0.3
    base.y += (clamp(pitch / 25, -1, 1) - base.y) * 0.3
  }

  const onMotion = (event: DeviceMotionEvent) => {
    const rate = event.rotationRate
    if (!rate || rate.beta == null || rate.gamma == null) return
    const dt = clamp((event.interval || 16) / 1000, 0.001, 0.05)
    const rad = (screenAngle() * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    gyro.x = clamp(gyro.x + (rate.gamma * cos - rate.beta * sin) * dt, -70, 70)
    gyro.y = clamp(gyro.y + (rate.gamma * sin + rate.beta * cos) * dt, -70, 70)
  }

  if (fine) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    cleanups.push(() => window.removeEventListener('pointermove', onPointer))
  } else {
    // iOS only delivers these after the hero's permission tap; until then the
    // section simply stays level rather than guessing.
    window.addEventListener('deviceorientation', onOrientation, true)
    window.addEventListener('devicemotion', onMotion, true)
    cleanups.push(() => window.removeEventListener('deviceorientation', onOrientation, true))
    cleanups.push(() => window.removeEventListener('devicemotion', onMotion, true))
  }

  previous = 0
  frame = requestAnimationFrame(tick)
  detach = () => {
    cleanups.forEach((cleanup) => cleanup())
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    previous = 0
    compass = null
    base.x = 0
    base.y = 0
    gyro.x = 0
    gyro.y = 0
    value.x = 0
    value.y = 0
    detach = null
  }
}

export function subscribeTilt(listener: Listener) {
  listeners.add(listener)
  attach()
  return () => {
    listeners.delete(listener)
    if (!listeners.size) detach?.()
  }
}
