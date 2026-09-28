import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Group, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { toothParts } from '../../data/content'
import { Studio } from '../hero/ToothScene'
import { createToothParts, type ToothPartKey } from '../hero/toothGeometry'
import { buildMolarParts, MOLAR_URL, type ToothParts } from './molarModel'

const CYAN = '#00a9dd'

type Drag = { down: boolean; lastX: number; yaw: number }
type Markers = Record<ToothPartKey, HTMLButtonElement | null>

type Props = {
  active: ToothPartKey
  onSelect: (key: ToothPartKey) => void
  reduce: boolean
}

export default function ExplorerScene({ active, onSelect, reduce }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const markers = useRef<Markers>({ enamel: null, crown: null, pulp: null, root: null })
  const drag = useRef<Drag>({ down: false, lastX: 0, yaw: 0 })
  const [visible, setVisible] = useState(true)

  // Stop rendering entirely while scrolled away.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={wrap}
      // pan-y: a horizontal drag rotates the tooth, a vertical one still
      // scrolls the page on touch screens.
      className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        drag.current.down = true
        drag.current.lastX = e.clientX
      }}
      onPointerMove={(e) => {
        if (!drag.current.down) return
        drag.current.yaw += (e.clientX - drag.current.lastX) * 0.008
        drag.current.lastX = e.clientX
      }}
      onPointerUp={() => (drag.current.down = false)}
      onPointerLeave={() => (drag.current.down = false)}
    >
      <Canvas
        // Capped at 1.5 — see ToothScene.tsx's dpr note on software-rendered
        // WebGL; this canvas is larger than the hero's was, so full HiDPI
        // would multiply that cost further.
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8.6], fov: 26 }}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        aria-hidden="true"
      >
        <Studio />
        {/* The real (CT-derived) molar; the procedural stand-in only if the
            file fails to load, so the explorer never ends up empty. */}
        <ModelBoundary fallback={<ProceduralTooth active={active} markers={markers} drag={drag} reduce={reduce} />}>
          <Suspense fallback={null}>
            <MolarTooth active={active} markers={markers} drag={drag} reduce={reduce} />
          </Suspense>
        </ModelBoundary>
      </Canvas>

      {/* Labels pinned to each part's anchor on the model; positions are
          written straight to style every frame (not React state). Mouse-only
          shortcuts — the list beside the model is the keyboard/screen-reader
          route to the same controls, so these stay out of the tab order. */}
      {toothParts.map((part) => {
        const selected = part.key === active
        return (
          <button
            key={part.key}
            ref={(el) => {
              markers.current[part.key] = el
            }}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onSelect(part.key)}
            className="absolute top-0 left-0 flex -translate-x-[6px] -translate-y-1/2 items-center gap-2 opacity-0 transition-opacity duration-300"
          >
            <span className="relative grid size-3 place-items-center">
              {selected && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-cyan/60" />}
              <span
                className={`relative size-3 rounded-full ring-4 transition-colors duration-300 ${
                  selected ? 'bg-cyan ring-cyan/25' : 'bg-bone ring-white/15'
                }`}
              />
            </span>
            <span
              className={`rounded-md px-2 py-1 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors duration-300 ${
                selected ? 'bg-cyan text-ink' : 'bg-ink/80 text-bone/80 ring-1 ring-white/10 hover:text-bone'
              }`}
            >
              {part.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type SceneProps = {
  active: ToothPartKey
  markers: MutableRefObject<Markers>
  drag: MutableRefObject<Drag>
  reduce: boolean
}

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function MolarTooth(props: SceneProps) {
  const gltf = useLoader(GLTFLoader, MOLAR_URL)
  const parts = useMemo(() => buildMolarParts(gltf.scene), [gltf])
  return <Tooth {...props} parts={parts} vertexColors />
}

function ProceduralTooth(props: SceneProps) {
  const parts = useMemo(() => createToothParts(), [])
  return <Tooth {...props} parts={parts} vertexColors={false} />
}

function Tooth({ active, markers, drag, reduce, parts, vertexColors }: SceneProps & { parts: ToothParts; vertexColors: boolean }) {
  const mats = useMemo(
    () => ({
      // With the real model, base colour is white and its own painted
      // vertex colour supplies the enamel-white → root-yellow gradient.
      crown: new MeshStandardMaterial({
        color: vertexColors ? '#ffffff' : '#dedad2',
        vertexColors,
        roughness: 0.32,
        metalness: 0.05,
        emissive: CYAN,
        emissiveIntensity: 0,
        transparent: true,
      }),
      roots: new MeshStandardMaterial({
        color: vertexColors ? '#ffffff' : '#d4cbbc',
        vertexColors,
        roughness: 0.45,
        metalness: 0.03,
        emissive: CYAN,
        emissiveIntensity: 0,
        transparent: true,
      }),
      enamel: new MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 0.7, roughness: 0.2, transparent: true, opacity: 0, depthWrite: false }),
      pulp: new MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 0.9, roughness: 0.4, transparent: true, opacity: 0 }),
    }),
    [vertexColors],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const group = useRef<Group>(null)
  const { camera, size } = useThree()
  const tmp = useMemo(() => ({ p: new Vector3(), view: new Vector3(), center: new Vector3() }), [])

  // Fit the camera to the stage's shape. The desktop framing (z 8.6) is
  // height-driven; a tall, narrow phone stage needs to pull back so the
  // tooth's width plus room for the labels beside it (~3.7 units) still
  // fits across. 0.4618 = 2·tan(fov/2) for the 26° fov.
  useEffect(() => {
    const aspect = size.width / size.height
    camera.position.z = Math.max(8.6, 3.7 / (0.4618 * aspect))
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime

    // A slow side-to-side sway (not a full spin — the labelled parts stay
    // facing the viewer) plus whatever the visitor has dragged it by.
    g.rotation.y = -0.45 + drag.current.yaw + (reduce ? 0 : Math.sin(t * 0.3) * 0.4)
    g.rotation.x = 0.16
    g.updateMatrixWorld()

    // Ease every highlight toward its target instead of snapping.
    const k = reduce ? 1 : 1 - Math.exp(-delta * 6)
    const ease = (from: number, to: number) => from + (to - from) * k
    const xray = active === 'pulp'
    mats.crown.opacity = ease(mats.crown.opacity, xray ? 0.14 : 1)
    mats.roots.opacity = ease(mats.roots.opacity, xray ? 0.14 : 1)
    // See-through only while actually faded, so the pulp shows through;
    // otherwise normal depth writes keep the solid tooth sorting correctly.
    mats.crown.depthWrite = mats.roots.depthWrite = mats.crown.opacity > 0.98
    mats.crown.emissiveIntensity = ease(mats.crown.emissiveIntensity, active === 'crown' ? 0.42 : 0)
    mats.roots.emissiveIntensity = ease(mats.roots.emissiveIntensity, active === 'root' ? 0.42 : 0)
    mats.enamel.opacity = ease(mats.enamel.opacity, active === 'enamel' ? 0.42 : 0)
    mats.pulp.opacity = ease(mats.pulp.opacity, xray ? 1 : 0)

    // Pin each label to its anchor: project into screen space, and dim it
    // while its side of the tooth has swung away from the viewer.
    tmp.center.setFromMatrixPosition(g.matrixWorld).applyMatrix4(camera.matrixWorldInverse)
    for (const key of Object.keys(parts.anchors) as ToothPartKey[]) {
      const el = markers.current[key]
      if (!el) continue
      tmp.p.copy(parts.anchors[key]).applyMatrix4(g.matrixWorld)
      tmp.view.copy(tmp.p).applyMatrix4(camera.matrixWorldInverse)
      const behind = key !== 'pulp' && tmp.view.z < tmp.center.z - 0.2
      tmp.p.project(camera)
      const x = (tmp.p.x * 0.5 + 0.5) * size.width
      const y = (-tmp.p.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.style.opacity = behind ? '0.35' : '1'
    }
  })

  return (
    <group ref={group}>
      {/* renderOrder: pulp first, so the faded tooth draws over it. */}
      <mesh geometry={parts.pulp} material={mats.pulp} renderOrder={0} />
      <mesh geometry={parts.roots} material={mats.roots} renderOrder={1} />
      <mesh geometry={parts.crown} material={mats.crown} renderOrder={1} />
      <mesh geometry={parts.enamel} material={mats.enamel} renderOrder={2} />
    </group>
  )
}
