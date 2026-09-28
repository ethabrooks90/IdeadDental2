let cached: boolean | undefined

export function canUseWebGL() {
  if (cached !== undefined) return cached
  try {
    const canvas = document.createElement('canvas')
    cached = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}
