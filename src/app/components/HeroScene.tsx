import { Environment, Float, Lightformer, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const EMBER = '#ff5a2b'
const COOL = '#8491ff'

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

/**
 * The hero sculpture: a polished, slowly distorting sphere inside a wire
 * shell and two orbit rings, with a dot travelling the inner ring. The
 * environment map is built from lightformers, so there is no HDR download.
 */
function Core({ reduced }: { reduced: boolean }) {
  // The scene is authored for a wide frame; on a narrow phone the same camera
  // would push the sculpture past the edges, so scale it to the view width.
  const width = useThree((state) => state.viewport.width)
  const scale = THREE.MathUtils.clamp(width / 4.6, 0.6, 1)
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const orbit = useRef<THREE.Group>(null)
  const counter = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (reduced) return
    const d = Math.min(delta, 0.05)
    if (group.current) {
      group.current.rotation.y += d * 0.14
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.22, 2.5, d)
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -state.pointer.x * 0.08, 2, d)
    }
    if (shell.current) {
      shell.current.rotation.y -= d * 0.05
      shell.current.rotation.z += d * 0.03
    }
    if (orbit.current) orbit.current.rotation.z += d * 0.36
    if (counter.current) counter.current.rotation.z -= d * 0.1
  })

  return (
    <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.2} floatIntensity={reduced ? 0 : 0.5}>
      <group ref={group} position={[0, 0.3, 0]} scale={scale}>
        <mesh>
          <sphereGeometry args={[1.26, 128, 128]} />
          <MeshDistortMaterial
            color="#241b16"
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
          <meshBasicMaterial color={EMBER} wireframe transparent opacity={0.13} />
        </mesh>

        <group ref={orbit} rotation={[Math.PI / 2.15, 0.18, 0]}>
          <mesh>
            <torusGeometry args={[2.02, 0.008, 8, 240]} />
            <meshBasicMaterial color={EMBER} transparent opacity={0.65} />
          </mesh>
          <mesh position={[2.02, 0, 0]}>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshBasicMaterial color="#ffd8c6" />
          </mesh>
        </group>

        <group ref={counter} rotation={[Math.PI / 1.6, -0.45, 0.55]}>
          <mesh>
            <torusGeometry args={[2.42, 0.004, 8, 240]} />
            <meshBasicMaterial color={COOL} transparent opacity={0.38} />
          </mesh>
        </group>

        <Sparkles count={64} scale={[7, 5.5, 5]} size={2.4} speed={reduced ? 0 : 0.3} color="#ffe0cf" opacity={0.5} />
      </group>
    </Float>
  )
}

/** Camera drifts toward the cursor and always looks at the core. */
function Rig({ reduced }: { reduced: boolean }) {
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    const x = reduced ? 0 : state.pointer.x * 0.55
    const y = reduced ? 0 : state.pointer.y * 0.32
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, x, 2, d)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, y, 2, d)
    state.camera.lookAt(0, 0.2, 0)
  })
  return null
}

export function HeroScene() {
  const reduced = usePrefersReducedMotion()
  const supported = useWebGL()

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Warm halo under the canvas: keeps the hero alive while WebGL boots
          and holds the composition together on machines without it. */}
      <div className="absolute left-1/2 top-[38%] size-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_90_43/0.20),rgb(132_145_255/0.10)_55%,transparent_72%)] blur-2xl" />
      {supported && (
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 0, 5.2], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 2, 4]} intensity={45} distance={14} color={EMBER} />
            <pointLight position={[-4, -1.5, -3]} intensity={35} distance={16} color={COOL} />
            <pointLight position={[0, 4, -2]} intensity={18} distance={14} color="#fff1e4" />
            <Environment resolution={128}>
              <Lightformer form="ring" intensity={5} color={EMBER} position={[3, 2.5, 2]} scale={4} />
              <Lightformer form="rect" intensity={2.4} color={COOL} position={[-4, -2, 1]} scale={[5, 2, 1]} />
              <Lightformer form="rect" intensity={1.6} color="#fff4e8" position={[0, 5, -3]} scale={[8, 3, 1]} />
            </Environment>
            <Core reduced={reduced} />
            <Rig reduced={reduced} />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
