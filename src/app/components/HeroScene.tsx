import { Environment, Float, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import * as THREE from 'three'

// Hsin's palette, from her key art: vermilion silk, moon ivory, lacquer gold
// and a thread of jade. The sculpture is lit like a lantern under the moon.
const CRIMSON = '#d8342f'
const IVORY = '#f8efe4'
const GOLD = '#e0a15c'
const JADE = '#4f9b8e'

/** A soft moon, painted once into a texture so it costs nothing per frame. */
function useMoonTexture() {
  return useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const gradient = ctx.createRadialGradient(size * 0.42, size * 0.38, 0, size * 0.5, size * 0.5, size * 0.5)
    gradient.addColorStop(0, 'rgba(255,248,236,1)')
    gradient.addColorStop(0.4, 'rgba(247,227,189,0.92)')
    gradient.addColorStop(0.62, 'rgba(230,174,104,0.42)')
    gradient.addColorStop(0.82, 'rgba(216,52,47,0.14)')
    gradient.addColorStop(1, 'rgba(10,6,7,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

/** Follows the OS setting live, so the scene stops moving when asked to. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

/** True on mouse/trackpad hardware, false on touch-first screens. */
function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const update = () => setFine(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return fine
}

function useWebGL() {
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      setSupported(Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl')))
    } catch {
      setSupported(false)
    }
  }, [])
  return supported
}

interface DeviceTilt {
  current: { x: number; y: number }
}

type MotionPermission = () => Promise<'granted' | 'denied'>

type PermissionCapableDeviceOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: MotionPermission
}

type PermissionCapableDeviceMotion = typeof DeviceMotionEvent & {
  requestPermission?: MotionPermission
}

/** Screen rotation, so a landscape lean still maps onto the right axis. */
function screenAngle() {
  const angle = typeof screen !== 'undefined' ? screen.orientation?.angle : 0
  return typeof angle === 'number' ? angle : 0
}

/** Shortest way round the compass, so 359° → 1° does not swing the scene. */
function wrapDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180
}

/**
 * Phone motion parallax, driven by the gyroscope.
 *
 * Two sensor streams feed it: `devicemotion`'s rotationRate is the gyroscope,
 * an angular velocity, so actually moving the phone gives a quick shove with
 * momentum; `deviceorientation` gives the absolute lean it settles at, so the
 * sculpture still follows the angle the phone is held at. A slowly re-centring
 * compass baseline adds yaw, so turning the phone reads as depth. Everything
 * is smoothed on the frame clock rather than per event, which keeps fast
 * flicks fluid instead of steppy. iOS only unlocks the sensors after a tap, so
 * the hero exposes a control rather than silently doing nothing.
 */
function useDeviceTilt(reduced: boolean, sensorMode: boolean) {
  const target = useRef({ x: 0, y: 0 })
  const base = useRef({ x: 0, y: 0 })
  const gyro = useRef({ x: 0, y: 0 })
  const orientationHandler = useRef<((event: DeviceOrientationEvent) => void) | null>(null)
  const motionHandler = useRef<((event: DeviceMotionEvent) => void) | null>(null)
  const listening = useRef(false)
  const seen = useRef(false)
  const compass = useRef<number | null>(null)
  const [active, setActive] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [denied, setDenied] = useState(false)

  const listen = useCallback(() => {
    if (listening.current) return
    listening.current = true

    const onOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event
      if (beta == null || gamma == null) return

      // Rotate the lean into portrait space, so landscape feels the same.
      const rad = (screenAngle() * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const roll = gamma * cos - (beta - 90) * sin
      const pitch = gamma * sin + (beta - 90) * cos

      // A slowly re-centring yaw keeps "turning" the phone meaningful, without
      // leaving the scene parked off to one side afterwards.
      let yaw = 0
      if (alpha != null) {
        if (compass.current == null) compass.current = alpha
        const delta = wrapDegrees(alpha - compass.current)
        compass.current += delta * 0.004
        yaw = THREE.MathUtils.clamp(delta / 70, -0.45, 0.45)
      }

      const goalX = THREE.MathUtils.clamp(roll / 21 + yaw, -1, 1)
      const goalY = THREE.MathUtils.clamp(pitch / 25, -1, 1)
      base.current.x += (goalX - base.current.x) * 0.3
      base.current.y += (goalY - base.current.y) * 0.3

      if (!seen.current) {
        seen.current = true
        setActive(true)
      }
    }

    const onMotion = (event: DeviceMotionEvent) => {
      const rate = event.rotationRate
      if (!rate || rate.beta == null || rate.gamma == null) return
      const dt = THREE.MathUtils.clamp((event.interval || 16) / 1000, 0.001, 0.05)
      const rad = (screenAngle() * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      // Angular rate around each axis, in screen space, in degrees per second.
      const rollRate = rate.gamma * cos - rate.beta * sin
      const pitchRate = rate.gamma * sin + rate.beta * cos
      // Integrate the rate into a lean that decays by itself: a real movement
      // gives a visible shove, holding still settles back to level.
      const decay = Math.exp(-3.4 * dt)
      gyro.current.x = THREE.MathUtils.clamp(gyro.current.x * decay + rollRate * dt, -70, 70)
      gyro.current.y = THREE.MathUtils.clamp(gyro.current.y * decay + pitchRate * dt, -70, 70)

      if (!seen.current) {
        seen.current = true
        setActive(true)
      }
    }

    orientationHandler.current = onOrientation
    motionHandler.current = onMotion
    window.addEventListener('deviceorientation', onOrientation, true)
    window.addEventListener('devicemotion', onMotion, true)
  }, [])

  const stop = useCallback(() => {
    if (orientationHandler.current) window.removeEventListener('deviceorientation', orientationHandler.current, true)
    if (motionHandler.current) window.removeEventListener('devicemotion', motionHandler.current, true)
    // Reset the guards too: React remounts effects in development, and a guard
    // left set would silently skip attaching the sensors on the second mount.
    orientationHandler.current = null
    motionHandler.current = null
    listening.current = false
    seen.current = false
    compass.current = null
    base.current = { x: 0, y: 0 }
    gyro.current = { x: 0, y: 0 }
    target.current = { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    if (reduced || !sensorMode) return
    const DOE = window.DeviceOrientationEvent as PermissionCapableDeviceOrientation | undefined
    const DOM = window.DeviceMotionEvent as PermissionCapableDeviceMotion | undefined
    if (!DOE && !DOM) return
    // Attach straight away: wherever events are allowed without a prompt this
    // is all it takes. iOS stays silent until the tap below, which is why the
    // enable control is shown until readings actually arrive.
    listen()
    if (typeof DOE?.requestPermission === 'function' || typeof DOM?.requestPermission === 'function') {
      setNeedsPermission(true)
    }
    // Detach when the input source changes (a tablet gaining a mouse, a phone
    // turned sideways into a desktop window) so the cursor is never fighting a
    // stale sensor reading.
    return () => {
      stop()
      setNeedsPermission(false)
      setActive(false)
    }
  }, [listen, reduced, sensorMode, stop])

  // One frame-clock smoother for both streams: the gyro decays in real time, so
  // momentum dies away even if the sensor stops reporting, and the result glides
  // toward its goal instead of stepping once per sensor event.
  useEffect(() => {
    if (!active || reduced) return
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05)
      previous = now
      const decay = Math.exp(-3.4 * dt)
      gyro.current.x *= decay
      gyro.current.y *= decay
      const goalX = THREE.MathUtils.clamp(base.current.x + gyro.current.x / 48, -1, 1)
      const goalY = THREE.MathUtils.clamp(base.current.y + gyro.current.y / 48, -1, 1)
      const k = 1 - Math.exp(-9 * dt)
      target.current.x += (goalX - target.current.x) * k
      target.current.y += (goalY - target.current.y) * k
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, reduced])

  const request = useCallback(async () => {
    const DOE = window.DeviceOrientationEvent as PermissionCapableDeviceOrientation | undefined
    const DOM = window.DeviceMotionEvent as PermissionCapableDeviceMotion | undefined
    const prompts: Promise<'granted' | 'denied'>[] = []
    if (typeof DOE?.requestPermission === 'function') prompts.push(DOE.requestPermission())
    if (typeof DOM?.requestPermission === 'function') prompts.push(DOM.requestPermission())
    if (!prompts.length) {
      listen()
      return
    }
    try {
      // iOS may answer one stream and refuse the other; either granted stream is
      // enough to drive the scene, so do not fail the whole thing on one.
      const results = await Promise.allSettled(prompts)
      setNeedsPermission(false)
      const granted = results.some((result) => result.status === 'fulfilled' && result.value === 'granted')
      setDenied(!granted)
      if (granted) listen()
    } catch {
      // Some browsers expose the API but refuse the prompt; keep listening in
      // case events are delivered anyway rather than declaring tilt broken.
      setNeedsPermission(false)
      listen()
    }
  }, [listen])

  return { target, active, needsPermission, denied, request }
}

interface DragState {
  spin: { current: number }
  tilt: { current: number }
  dragging: { current: boolean }
  device: DeviceTilt
}

/**
 * Lantern motes: the pollen and embers of her night market, not stars.
 *
 * One THREE.Points cloud with a hand-painted glow sprite. Each mote carries
 * its own phase and speed, rising on a slow sway; the whole cloud lifts a
 * little faster than the page as it scrolls, so the air has depth. Single draw
 * call, no per-frame allocation, and it freezes completely under reduced
 * motion.
 */
function LanternMotes({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null)

  const { geometry, material, base, seeds } = useMemo(() => {
    const count = 120
    const base = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 2)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    // Weighted like her art: mostly moon cream and lantern gold, an occasional
    // vermilion mote, a rare jade glint.
    const palette = [IVORY, GOLD, IVORY, GOLD, CRIMSON, IVORY, GOLD, JADE].map((hex) => new THREE.Color(hex))
    for (let i = 0; i < count; i += 1) {
      base[i * 3] = (Math.random() - 0.5) * 10
      base[i * 3 + 1] = (Math.random() - 0.5) * 7
      base[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.6
      seeds[i * 2] = Math.random() * Math.PI * 2
      seeds[i * 2 + 1] = 0.25 + Math.random() * 0.85
      const tint = palette[i % palette.length]
      const strength = 0.45 + Math.random() * 0.55
      colors[i * 3] = tint.r * strength
      colors[i * 3 + 1] = tint.g * strength
      colors[i * 3 + 2] = tint.b * strength
      positions[i * 3] = base[i * 3]
      positions[i * 3 + 1] = base[i * 3 + 1]
      positions[i * 3 + 2] = base[i * 3 + 2]
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // A soft warm bloom, painted once instead of shipped as an image.
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      glow.addColorStop(0, 'rgba(255,248,236,1)')
      glow.addColorStop(0.3, 'rgba(255,232,192,0.66)')
      glow.addColorStop(0.62, 'rgba(255,190,132,0.2)')
      glow.addColorStop(1, 'rgba(255,180,120,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 64, 64)
    }
    const sprite = new THREE.CanvasTexture(canvas)
    sprite.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.PointsMaterial({
      size: 0.105,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    return { geometry, material, base, seeds }
  }, [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.map?.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    const mesh = points.current
    if (!mesh) return
    const attr = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const array = attr.array as Float32Array
    const time = state.clock.elapsedTime
    // The cloud outruns the page slightly on scroll: near motes drift past,
    // far ones barely move.
    mesh.position.y = reduced ? 0 : Math.min(window.scrollY, 1600) * 0.0006
    for (let i = 0; i < array.length / 3; i += 1) {
      const phase = seeds[i * 2]
      const speed = seeds[i * 2 + 1]
      array[i * 3] = reduced ? base[i * 3] : base[i * 3] + Math.sin(time * 0.26 + phase) * 0.3
      array[i * 3 + 1] = reduced ? base[i * 3 + 1] : ((time * speed * 0.16 + phase * 1.7) % 7) - 3.5
      array[i * 3 + 2] = base[i * 3 + 2]
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  )
}

/**
 * The hero sculpture: a polished, slowly distorting sphere inside a wire
 * shell and two orbit rings, with a dot travelling the inner ring. The
 * environment map is built from lightformers, so there is no HDR download.
 * Dragging (mouse or finger) spins it, and phone tilt leans the whole rig.
 */
function Core({ reduced, spin, tilt, dragging, device, fine }: { reduced: boolean; fine: boolean } & DragState) {
  const moon = useMoonTexture()
  // The canvas is a wide band on desktop and a short, narrow band on phones.
  // Fit the sculpture to whichever frame it is actually in.
  const width = useThree((state) => state.viewport.width)
  const height = useThree((state) => state.viewport.height)
  const scale = THREE.MathUtils.clamp(Math.min(width / 4.6, height / 3.4), 0.55, 1)
  // Travel is in world units, so a narrow phone band needs proportionally less
  // of it to leave the sculpture sitting half off-screen.
  const reach = THREE.MathUtils.clamp(width / 6.4, 0.45, 1)
  const rig = useRef<THREE.Group>(null)
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const orbit = useRef<THREE.Group>(null)
  const counter = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    // One lean value drives the whole assembly: the phone supplies it from the
    // sensors, the desktop from the cursor, so both input paths actually tilt
    // the sculpture instead of only nudging the camera.
    const lean = reduced
      ? { x: 0, y: 0 }
      : {
          x: THREE.MathUtils.clamp(device.current.x + (fine ? state.pointer.x * 0.5 : 0), -1.3, 1.3),
          y: THREE.MathUtils.clamp(device.current.y + (fine ? state.pointer.y * 0.5 : 0), -1.3, 1.3),
        }
    if (rig.current) {
      // Big, readable angles plus a slide across the frame: a sphere spinning in
      // place still looks like a sphere, so the orbit rings, the wire shell and
      // the shift of the whole silhouette are what make the tilt obvious.
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, lean.y * 0.25, 5, d)
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, lean.x * 0.38, 5, d)
      rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, -lean.x * 0.11, 4, d)
      rig.current.position.x = THREE.MathUtils.damp(rig.current.position.x, -lean.x * 0.34 * reach, 5, d)
      rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, lean.y * 0.2 * reach, 5, d)
    }
    if (group.current) {
      if (!reduced && !dragging.current) group.current.rotation.y += d * 0.14
      // Fling from the last drag, easing out instead of stopping dead.
      group.current.rotation.y += spin.current
      spin.current *= 0.93
      tilt.current *= 0.9
      // Cursor parallax only where there is a real pointer: on a phone it would
      // otherwise stay pinned to the last touch and fight the sensor.
      const aim = reduced ? tilt.current : (fine ? state.pointer.y * 0.26 : 0) + tilt.current
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, aim, 3, d)
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, reduced || !fine ? 0 : -state.pointer.x * 0.1, 2, d)
    }
    if (reduced) return
    if (shell.current) {
      shell.current.rotation.y -= d * 0.05
      shell.current.rotation.z += d * 0.03
    }
    if (orbit.current) orbit.current.rotation.z += d * 0.36
    if (counter.current) counter.current.rotation.z -= d * 0.1
  })

  return (
    <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.2} floatIntensity={reduced ? 0 : 0.5}>
      <group ref={rig}>
        <group ref={group} position={[0, 0.3, 0]} scale={scale}>
          {moon && (
            <mesh position={[0.55, 0.5, -2.6]} scale={5.4}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={moon} transparent depthWrite={false} opacity={0.9} />
            </mesh>
          )}

          <mesh>
            <sphereGeometry args={[1.26, 128, 128]} />
            <MeshDistortMaterial
              color="#1a1012"
              metalness={1}
              roughness={0.14}
              distort={0.34}
              speed={reduced ? 0 : 1.2}
              clearcoat={1}
              clearcoatRoughness={0.28}
              envMapIntensity={1.6}
            />
          </mesh>

          <mesh ref={shell}>
            <icosahedronGeometry args={[1.62, 1]} />
            <meshBasicMaterial color={CRIMSON} wireframe transparent opacity={0.3} />
          </mesh>

          <group ref={orbit} rotation={[Math.PI / 2.15, 0.18, 0]}>
            <mesh>
              <torusGeometry args={[2.02, 0.008, 8, 240]} />
              <meshBasicMaterial color={CRIMSON} transparent opacity={0.8} />
            </mesh>
            <mesh position={[2.02, 0, 0]}>
              <sphereGeometry args={[0.048, 16, 16]} />
              <meshBasicMaterial color={IVORY} />
            </mesh>
          </group>

          <group ref={counter} rotation={[Math.PI / 1.6, -0.45, 0.55]}>
            <mesh>
              <torusGeometry args={[2.42, 0.004, 8, 240]} />
              <meshBasicMaterial color={JADE} transparent opacity={0.45} />
            </mesh>
          </group>

          <LanternMotes reduced={reduced} />
        </group>
      </group>
    </Float>
  )
}

/** Camera drifts toward the cursor and the phone's tilt, always facing the core. */
function Rig({ reduced, device, fine }: { reduced: boolean; device: DeviceTilt; fine: boolean }) {
  const width = useThree((state) => state.viewport.width)
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    const reach = THREE.MathUtils.clamp(width / 6.4, 0.45, 1)
    const pointerX = fine ? state.pointer.x : 0
    const pointerY = fine ? state.pointer.y : 0
    const x = reduced ? 0 : pointerX * 0.55 + device.current.x * 0.7 * reach
    const y = reduced ? 0 : pointerY * 0.34 + device.current.y * 0.43 * reach
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, x, 3.2, d)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, y, 3.2, d)
    state.camera.lookAt(0, 0.18, 0)
    // Rolling the frame itself is the strongest cue that something tilted: the
    // horizon of the whole scene tips, not just the object inside it.
    state.camera.rotation.z = reduced ? 0 : device.current.x * 0.09 + pointerX * 0.03
  })
  return null
}

export function HeroScene() {
  const reduced = usePrefersReducedMotion()
  const supported = useWebGL()
  const fine = useFinePointer()
  // Mouse or trackpad gets the cursor as its tilt source, touch screens get the
  // gyroscope, never both, so the two input paths cannot fight each other.
  const { target: device, active: tiltOn, needsPermission, denied, request } = useDeviceTilt(reduced, !fine)
  const spin = useRef(0)
  const tilt = useRef(0)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  function start(e: ReactPointerEvent<HTMLDivElement>) {
    // A touch on the sculpture is itself a user gesture, so it can unlock the
    // iOS sensor without the visitor hunting for the little button.
    if (needsPermission && !tiltOn) void request()
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function move(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    spin.current = THREE.MathUtils.clamp(spin.current + dx * 0.008, -0.55, 0.55)
    tilt.current = THREE.MathUtils.clamp(tilt.current + dy * 0.003, -0.35, 0.35)
  }

  function end() {
    dragging.current = false
  }

  return (
    <div
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
    >
      {/* The moon sits under the canvas, so the hero is already a scene while
          WebGL boots and on machines without it. */}
      <div aria-hidden className="moon-disc absolute left-1/2 top-1/2 size-[74vmin] max-h-[440px] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl" />
      {supported && (
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 0, 5.2], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 2, 4]} intensity={48} distance={14} color={CRIMSON} />
            <pointLight position={[-4, -1.5, -3]} intensity={30} distance={16} color={JADE} />
            <pointLight position={[0, 4, -2]} intensity={22} distance={14} color={GOLD} />
            <Environment resolution={128}>
              <Lightformer form="ring" intensity={6} color={CRIMSON} position={[3, 2.5, 2]} scale={4} />
              <Lightformer form="rect" intensity={2.6} color={GOLD} position={[-4, -2, 1]} scale={[5, 2, 1]} />
              <Lightformer form="rect" intensity={1.6} color={IVORY} position={[2, -3, 2]} scale={[3, 1, 1]} />
              <Lightformer form="rect" intensity={1.2} color={JADE} position={[0, 5, -3]} scale={[8, 3, 1]} />
            </Environment>
            <Core reduced={reduced} fine={fine} spin={spin} tilt={tilt} dragging={dragging} device={device} />
            <Rig reduced={reduced} device={device} fine={fine} />
          </Suspense>
        </Canvas>
      )}

      {/* Cues for the two ways to move the object. On iOS the tilt control is
          a real button, because the sensor needs a tap to unlock. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-1.5">
        {!fine && needsPermission && !tiltOn && (
          <button
            type="button"
            // The hero drag handler captures the pointer on press, which would
            // eat this tap and keep iOS from ever granting sensor access.
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={request}
            className="pointer-events-auto inline-flex items-center gap-2 border border-accent bg-bg/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent-2 backdrop-blur-sm transition-colors hover:bg-accent hover:text-fg"
          >
            <span aria-hidden>◎</span>
            TAP TO ENABLE TILT
          </button>
        )}
        {denied && !tiltOn && (
          <span className="border border-line-strong bg-bg/85 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
            TILT BLOCKED // ALLOW MOTION IN SETTINGS
          </span>
        )}
        <span className="inline-flex items-center gap-2 border border-line-strong bg-bg/70 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-muted backdrop-blur-sm">
          <span className="text-accent-2">↔</span>
          {fine ? 'DRAG OR MOVE CURSOR // 3D' : tiltOn ? 'DRAG OR TILT // 3D' : 'DRAG TO ROTATE // 3D'}
        </span>
      </div>
    </div>
  )
}
