import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Group, Mesh, MeshStandardMaterial, PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { MotionValue } from 'framer-motion'
import { createToothGeometry } from './toothGeometry'

// Drop the licensed stock model at public/models/tooth.glb and set this to
// `${import.meta.env.BASE_URL}models/tooth.glb` — the scene swaps the
// procedural placeholder out and applies the same studio material.
const MODEL_URL: string | null = null

type Props = {
  /** 0 → 1 as the hero scrolls out of view. */
  scroll: MotionValue<number>
  /** Fixed pose, no animation — reduced motion and the still-render script. */
  still?: boolean
  onReady?: () => void
}

export default function ToothScene({ scroll, still = false, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  // Stop rendering entirely once the hero is off screen.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        // Fixed at 1 rather than following devicePixelRatio — a HiDPI
        // multiplier roughly doubles or triples the raster/fragment cost
        // for one decorative object, and that cost is what shows up as a
        // real, measured ~1.3s main-thread freeze on first mount when the
        // browser has no hardware GPU (see the profiling notes: this
        // environment renders WebGL through SwiftShader, a CPU-emulated
        // software renderer, same as it likely does for site visitors on
        // some devices/sandboxes — not just a local dev-machine quirk).
        dpr={1}
        camera={{ position: [0, 0, 6.6], fov: 26 }}
        frameloop={still ? 'demand' : visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: false, preserveDrawingBuffer: still, powerPreference: 'high-performance' }}
        onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}
        aria-hidden="true"
      >
        <Studio />
        <Suspense fallback={null}>
          <Tooth scroll={scroll} still={still} />
        </Suspense>
      </Canvas>
    </div>
  )
}

/** Monochrome studio: neutral room reflections, a key light, and a cool
 *  brand-cyan rim so the silhouette separates from the near-black stage. */
export function Studio() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.28
    invalidate()
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, invalidate])

  return (
    <>
      <directionalLight position={[-5, 6, 3]} intensity={1.9} />
      <directionalLight position={[6, 1, -4]} intensity={4.5} color="#3fc3ee" />
      <directionalLight position={[-2, -5, -4]} intensity={0.6} />
    </>
  )
}

// MeshStandardMaterial rather than MeshPhysicalMaterial. Measured: swapping
// this alone didn't move the ~1.3s first-mount cost (that's dominated by
// software-rendered WebGL itself — see dpr note above and toothGeometry.ts),
// but the clearcoat/sheen lobes still compile a needlessly heavier shader
// for what a small object gains from them here, so it stays simplified.
function useToothMaterial() {
  return useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#dedad2',
        roughness: 0.32,
        metalness: 0.05,
      }),
    [],
  )
}

// Sits right-of-center in the now full-bleed canvas, matching the
// reference's asymmetric crop — leaves the left/bottom dark for the
// overlaid headline instead of the tooth landing dead-center.
const BASE_X = 0.85
const BASE_Y = -0.05

// Hero.mp4's reference plays black → headline → image-reveal → a hold →
// one hard cut to a second framing → a second hold. The cut is the one beat
// that doesn't map onto fades or continuous motion, so it's reproduced here
// as a single quick reframe once the model has settled — not a repeating
// loop, since the brief calls for restrained motion on healthcare content.
const REFRAME_AT = 2.2
const REFRAME_DURATION = 0.45
const REFRAME_YAW = 0.62

function Tooth({ scroll, still }: { scroll: MotionValue<number>; still: boolean }) {
  const group = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const reframeStart = useRef<number | null>(null)

  useEffect(() => {
    if (still || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [still])

  useFrame((state, delta) => {
    const g = group.current
    if (!g || still) return
    const t = state.clock.elapsedTime
    const s = scroll.get()

    // One-time reframe (see REFRAME_AT above) — plays once, then the tooth
    // simply rests at the new angle.
    if (reframeStart.current === null && t > REFRAME_AT) reframeStart.current = t
    let reframe = 0
    if (reframeStart.current !== null) {
      const p = Math.min(1, (t - reframeStart.current) / REFRAME_DURATION)
      reframe = 1 - (1 - p) ** 3 // easeOutCubic — quick and decisive, not a slow drift
    }

    // Slow idle turn + scroll adds a half turn as the hero leaves.
    g.rotation.y = -0.6 + t * 0.16 + s * 1.4 + reframe * REFRAME_YAW
    // Ease toward the pointer rather than snapping to it.
    const k = 1 - Math.exp(-delta * 3)
    g.rotation.x += (0.26 + pointer.current.y * 0.14 - g.rotation.x) * k
    g.rotation.z += (-0.08 - pointer.current.x * 0.08 - g.rotation.z) * k
    g.position.x = BASE_X
    g.position.y = BASE_Y + Math.sin(t * 0.8) * 0.06 + s * 0.6
  })

  return (
    <group ref={group} position={[BASE_X, BASE_Y, 0]} rotation={[0.26, -0.6, -0.08]}>
      {MODEL_URL ? <GltfTooth url={MODEL_URL} /> : <ProceduralTooth />}
    </group>
  )
}

function ProceduralTooth() {
  const geometry = useMemo(() => createToothGeometry(), [])
  const material = useToothMaterial()
  return <mesh geometry={geometry} material={material} />
}

function GltfTooth({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  const material = useToothMaterial()
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true)
    root.traverse((o) => {
      if ((o as Mesh).isMesh) (o as Mesh).material = material
    })
    return root
  }, [gltf, material])
  return <primitive object={scene} />
}
