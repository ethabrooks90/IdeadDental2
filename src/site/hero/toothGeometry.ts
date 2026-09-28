import { Box3, BufferGeometry, CatmullRomCurve3, SphereGeometry, TubeGeometry, Vector3 } from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Procedural, stylised upper molar — a stand-in until the licensed stock
// model is delivered (see MODEL_URL in ToothScene.tsx). Deliberately
// idealised rather than clinical: it's a brand object, not a depiction of
// any real patient or treatment result.

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function crown() {
  // 80x60 rather than a much higher count — this is a small decorative
  // object at hero scale; the extra density was invisible on screen but
  // costs real CPU (deformation loop below) and GPU raster time, which
  // matters under software-rendered WebGL (see ToothScene.tsx's dpr note).
  const g = new SphereGeometry(1, 80, 60)
  const p = g.attributes.position
  const v = new Vector3()
  // Four cusps sitting on the occlusal table, slightly uneven like a real molar.
  const cusps = [
    [-0.42, 0.36, 0.17],
    [0.44, 0.34, 0.15],
    [-0.4, -0.38, 0.14],
    [0.42, -0.36, 0.12],
  ]

  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const { x, y, z } = v

    // Square the round cross-section toward a rounded box (superellipse).
    const theta = Math.atan2(z, x)
    const n = 3.2
    const k = 1 / Math.pow(Math.pow(Math.abs(Math.cos(theta)), n) + Math.pow(Math.abs(Math.sin(theta)), n), 1 / n)
    const square = 1 + (k - 1) * 0.45
    let nx = x * square
    let nz = z * square * 0.9
    let ny = y * (y > 0 ? 0.58 : 1.0)

    if (y > 0) {
      const w = smoothstep(0.35, 0.95, y)
      let h = 0
      for (const [cx, cz, amp] of cusps) h += amp * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / 0.1)
      // Central + transverse fissures between the cusps.
      h -= 0.07 * Math.exp(-(x * x) / 0.012) * smoothstep(0.6, 0.95, y)
      h -= 0.05 * Math.exp(-(z * z) / 0.018) * smoothstep(0.6, 0.95, y)
      ny += w * h
    } else {
      // Narrow toward the neck so the crown flows into the root trunk.
      const neck = 1 - 0.42 * smoothstep(0.05, 1, -y)
      nx *= neck
      nz *= neck
    }
    p.setXYZ(i, nx, ny + 0.35, nz)
  }
  return g
}

function root(points: [number, number, number][], radius: number, flatten: number) {
  const curve = new CatmullRomCurve3(points.map((q) => new Vector3(...q)))
  const tubular = 40
  const radial = 18
  const g = new TubeGeometry(curve, tubular, radius, radial, false)
  const p = g.attributes.position
  const v = new Vector3()
  const c = new Vector3()

  // TubeGeometry lays vertices out ring by ring, so the ring index gives t.
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular
    curve.getPointAt(t, c)
    const taper = 1 - 0.78 * Math.pow(t, 1.35)
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j
      v.fromBufferAttribute(p, idx).sub(c)
      v.x *= flatten
      v.multiplyScalar(taper)
      p.setXYZ(idx, c.x + v.x, c.y + v.y, c.z + v.z)
    }
  }

  // Round off the apex.
  const tipRadius = radius * 0.22
  const tip = new SphereGeometry(tipRadius, 12, 8)
  const end = curve.getPointAt(1)
  tip.scale(flatten, 1, 1)
  tip.translate(end.x, end.y, end.z)
  return [g, tip]
}

type RootSpec = { points: [number, number, number][]; radius: number; flatten: number }

const ROOTS: RootSpec[] = [
  {
    points: [
      [-0.34, -0.1, 0.1],
      [-0.46, -0.65, 0.16],
      [-0.44, -1.3, 0.2],
      [-0.3, -1.9, 0.24],
    ],
    radius: 0.37,
    flatten: 0.8,
  },
  {
    points: [
      [0.34, -0.1, 0.1],
      [0.47, -0.62, 0.14],
      [0.46, -1.22, 0.12],
      [0.36, -1.78, 0.08],
    ],
    radius: 0.36,
    flatten: 0.8,
  },
  // Palatal root — longest, angled back.
  {
    points: [
      [0, -0.1, -0.2],
      [0.02, -0.7, -0.42],
      [0.04, -1.4, -0.52],
      [0.06, -2.02, -0.5],
    ],
    radius: 0.36,
    flatten: 1,
  },
]

const rootParts = () => ROOTS.flatMap((r) => root(r.points, r.radius, r.flatten))

// Normalise attributes so the pieces can be merged, then weld seams and
// rebuild smooth normals across the whole shape.
function weld(parts: BufferGeometry[]) {
  const welded = parts.map((g) => {
    const clean = new BufferGeometry()
    clean.setAttribute('position', g.getAttribute('position'))
    clean.setIndex(g.getIndex())
    return mergeVertices(clean, 1e-4)
  })
  const merged = mergeGeometries(welded)
  merged.computeVertexNormals()
  return merged
}

export function createToothGeometry(): BufferGeometry {
  const merged = weld([crown(), ...rootParts()])
  merged.center()
  return merged
}

// Pulp: a flattened chamber inside the crown, plus a thin canal running
// down the middle of each root (same curves, much narrower tubes).
function pulpParts() {
  const chamber = new SphereGeometry(1, 32, 20)
  chamber.scale(0.36, 0.2, 0.28)
  chamber.translate(0, 0.14, 0)
  return [chamber, ...ROOTS.flatMap((r) => root(r.points, 0.085, r.flatten))]
}

/** Enamel shell: the crown pushed out along its normals — a thin outer
 *  layer that can glow on its own over the crown. */
function shell(g: BufferGeometry, offset: number) {
  const out = g.clone()
  const p = out.attributes.position
  const n = out.attributes.normal
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * offset, p.getY(i) + n.getY(i) * offset, p.getZ(i) + n.getZ(i) * offset)
  }
  return out
}

export type ToothPartKey = 'enamel' | 'crown' | 'pulp' | 'root'

/** The same molar as createToothGeometry, but kept in separately
 *  highlightable pieces, plus a hotspot anchor for each labelled part —
 *  all shifted by one shared offset so they line up with each other. */
export function createToothParts() {
  const crownG = weld([crown()])
  const rootsG = weld(rootParts())
  const pulpG = weld(pulpParts())
  const enamelG = shell(crownG, 0.035)

  crownG.computeBoundingBox()
  rootsG.computeBoundingBox()
  const box = new Box3().copy(crownG.boundingBox!).union(rootsG.boundingBox!)
  const offset = box.getCenter(new Vector3()).negate()
  for (const g of [crownG, rootsG, pulpG, enamelG]) g.translate(offset.x, offset.y, offset.z)

  const anchors: Record<ToothPartKey, Vector3> = {
    enamel: new Vector3(-0.42, 0.98, 0.36).add(offset),
    crown: new Vector3(1.02, 0.3, 0.32).add(offset),
    pulp: new Vector3(0, 0.14, 0).add(offset),
    root: new Vector3(0.72, -1.22, 0.14).add(offset),
  }
  return { crown: crownG, roots: rootsG, pulp: pulpG, enamel: enamelG, anchors }
}
