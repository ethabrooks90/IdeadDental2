import { BufferAttribute, BufferGeometry, Matrix4, Mesh, Vector3, type Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ToothPartKey } from '../hero/toothGeometry'

// "Maxillary First Molar with Two Root Canals" by University of Dundee,
// School of Dentistry — CC BY 4.0, credited under the explorer's stage (see
// ToothExplorer.tsx). Built from CT data; its tooth mesh carries a painted
// vertex colour (white enamel → yellow root) and the canals are separate
// meshes — both of which this uses to split out the explorer's parts.
export const MOLAR_URL = `${import.meta.env.BASE_URL}models/molar.glb`

/** Same framing as the procedural tooth: ~3.1 units tall, centred. */
const TARGET_HEIGHT = 3.1

export type ToothParts = {
  crown: BufferGeometry
  roots: BufferGeometry
  pulp: BufferGeometry
  enamel: BufferGeometry
  anchors: Record<ToothPartKey, Vector3>
}

export function buildMolarParts(root: Object3D): ToothParts {
  root.updateMatrixWorld(true)
  const meshes: Mesh[] = []
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh)
  })
  // Everything into one world space first (the file nests a Z-up → Y-up
  // conversion and an offset in its node hierarchy).
  const baked = meshes.map((m) => m.geometry.clone().applyMatrix4(m.matrixWorld))
  const toothIndex = baked.findIndex((g) => g.getAttribute('color'))
  const tooth = baked[toothIndex]
  const pulp = mergeGeometries(
    baked.filter((_, i) => i !== toothIndex).map((g) => {
      const clean = new BufferGeometry()
      clean.setAttribute('position', g.getAttribute('position'))
      clean.setAttribute('normal', g.getAttribute('normal'))
      clean.setIndex(g.getIndex())
      return clean
    }),
  )

  // Per-vertex "rootness" from the painted colour: enamel is near-white
  // (blue ≈ 0.95), root dentine yellow (blue ≈ 0.42).
  const color = tooth.getAttribute('color')
  const pos = tooth.getAttribute('position')
  const rootness = new Float32Array(pos.count)
  for (let i = 0; i < pos.count; i++) rootness[i] = Math.min(1, Math.max(0, (0.95 - color.getZ(i)) / (0.95 - 0.42)))

  // An upper molar sits crown-down in anatomical orientation; flip it
  // crown-up to match the explorer's framing and labels.
  let crownY = 0
  let rootY = 0
  let crownN = 0
  let rootN = 0
  for (let i = 0; i < pos.count; i++) {
    if (rootness[i] < 0.5) {
      crownY += pos.getY(i)
      crownN++
    } else {
      rootY += pos.getY(i)
      rootN++
    }
  }
  const all = [tooth, pulp]
  if (crownY / crownN < rootY / rootN) for (const g of all) g.applyMatrix4(new Matrix4().makeRotationX(Math.PI))

  // Centre on the tooth and scale to the target height.
  tooth.computeBoundingBox()
  const box = tooth.boundingBox!
  const center = box.getCenter(new Vector3())
  const s = TARGET_HEIGHT / (box.max.y - box.min.y)
  for (const g of all) g.applyMatrix4(new Matrix4().makeScale(s, s, s).multiply(new Matrix4().makeTranslation(-center.x, -center.y, -center.z)))

  // Split the tooth's triangles into crown / root by average rootness; both
  // halves share the same vertex buffers, only the index differs.
  const index = tooth.getIndex()!
  const crownIdx: number[] = []
  const rootIdx: number[] = []
  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t)
    const b = index.getX(t + 1)
    const c = index.getX(t + 2)
    ;(rootness[a] + rootness[b] + rootness[c] > 1.5 ? rootIdx : crownIdx).push(a, b, c)
  }
  const part = (idx: number[]) => {
    const g = new BufferGeometry()
    for (const name of ['position', 'normal', 'color']) g.setAttribute(name, tooth.getAttribute(name))
    g.setIndex(idx)
    return g
  }
  const crown = part(crownIdx)
  const roots = part(rootIdx)

  // Enamel shell: the crown's surface pushed out along its normals.
  const n = tooth.getAttribute('normal')
  const shellPos = new Float32Array(pos.count * 3)
  const p = tooth.getAttribute('position')
  for (let i = 0; i < p.count; i++) {
    shellPos[i * 3] = p.getX(i) + n.getX(i) * 0.03
    shellPos[i * 3 + 1] = p.getY(i) + n.getY(i) * 0.03
    shellPos[i * 3 + 2] = p.getZ(i) + n.getZ(i) * 0.03
  }
  const enamel = new BufferGeometry()
  enamel.setAttribute('position', new BufferAttribute(shellPos, 3))
  enamel.setAttribute('normal', n)
  enamel.setIndex(crownIdx)

  return { crown, roots, pulp, enamel, anchors: findAnchors(p, rootness, pulp) }
}

// Label anchors picked from the real surface rather than hard-coded, so they
// sit on the model whatever its exact proportions.
function findAnchors(pos: BufferGeometry['attributes'][string], rootness: Float32Array, pulp: BufferGeometry): Record<ToothPartKey, Vector3> {
  let minY = Infinity
  let maxY = -Infinity
  let neckY = 0
  let neckN = 0
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    if (rootness[i] > 0.4 && rootness[i] < 0.6) {
      neckY += y
      neckN++
    }
  }
  neckY = neckN ? neckY / neckN : (minY + maxY) / 2

  const pick = (keep: (i: number, y: number) => boolean, score: (x: number, y: number, z: number) => number) => {
    let best = -Infinity
    const out = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (!keep(i, y)) continue
      const v = score(pos.getX(i), y, pos.getZ(i))
      if (v > best) {
        best = v
        out.set(pos.getX(i), y, pos.getZ(i))
      }
    }
    return out
  }
  const crownMid = (neckY + maxY) / 2
  const rootMid = (minY + neckY) / 2
  const band = (mid: number, half: number) => (y: number) => Math.abs(y - mid) < half

  pulp.computeBoundingBox()
  const pb = pulp.boundingBox!
  const pulpCenter = pb.getCenter(new Vector3())

  return {
    // Top of the crown, leaning toward the viewer.
    enamel: pick((i) => rootness[i] < 0.2, (x, y, z) => y + z * 0.4 - x * 0.2),
    // Widest point of the crown, on the right.
    crown: pick((i, y) => rootness[i] < 0.3 && band(crownMid, (maxY - neckY) * 0.2)(y), (x) => x),
    // Upper part of the pulp (the chamber end, nearest the crown).
    pulp: new Vector3(pulpCenter.x, pb.max.y - (pb.max.y - pb.min.y) * 0.18, pulpCenter.z),
    // Mid-root, on the right.
    root: pick((i, y) => rootness[i] > 0.7 && band(rootMid, (neckY - minY) * 0.18)(y), (x) => x),
  }
}
