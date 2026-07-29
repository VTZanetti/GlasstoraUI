/**
 * The refraction filter definition, as a refcounted singleton.
 *
 * One <filter id="gt-refraction"> has to exist on the page while at least one
 * provider is mounted. Rendering it from the provider's own template made that
 * fragile in two ways: whichever provider happened to mount first owned the
 * definition, so unmounting it took the filter away from the providers still
 * running, and the "am I first" test read differently on the server than in the
 * browser, which is a hydration mismatch waiting for anyone who nests two
 * providers.
 *
 * Building it imperatively sidesteps both. Nothing is server rendered, and
 * nothing needs to be: the filter is only referenced once the provider has
 * probed the browser and set data-gt-refract, which is client side by nature.
 */

const FILTER_ID = 'gt-refraction'
const SVG_NS = 'http://www.w3.org/2000/svg'

let refCount = 0
let host: SVGSVGElement | null = null
let displacement: SVGElement | null = null

function build(strength: number): void {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'gt-defs')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')

  const defs = document.createElementNS(SVG_NS, 'defs')
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.setAttribute('id', FILTER_ID)
  filter.setAttribute('x', '-30%')
  filter.setAttribute('y', '-30%')
  filter.setAttribute('width', '160%')
  filter.setAttribute('height', '160%')
  filter.setAttribute('color-interpolation-filters', 'sRGB')

  const turbulence = document.createElementNS(SVG_NS, 'feTurbulence')
  turbulence.setAttribute('type', 'fractalNoise')
  turbulence.setAttribute('baseFrequency', '0.007 0.011')
  turbulence.setAttribute('numOctaves', '2')
  turbulence.setAttribute('seed', '7')
  turbulence.setAttribute('stitchTiles', 'stitch')
  turbulence.setAttribute('result', 'noise')

  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur')
  blur.setAttribute('in', 'noise')
  blur.setAttribute('stdDeviation', '1.5')
  blur.setAttribute('result', 'soft')

  const map = document.createElementNS(SVG_NS, 'feDisplacementMap')
  map.setAttribute('in', 'SourceGraphic')
  map.setAttribute('in2', 'soft')
  map.setAttribute('scale', String(strength))
  map.setAttribute('xChannelSelector', 'R')
  map.setAttribute('yChannelSelector', 'G')

  filter.append(turbulence, blur, map)
  defs.append(filter)
  svg.append(defs)
  document.body.append(svg)

  host = svg
  displacement = map
}

/** Mounts the filter if it is not there yet, and takes a reference to it. */
export function acquireRefractionFilter(strength: number): void {
  if (typeof document === 'undefined') return
  refCount++
  if (!host) build(strength)
  else setRefractionStrength(strength)
}

export function setRefractionStrength(strength: number): void {
  displacement?.setAttribute('scale', String(strength))
}

/** Drops a reference, removing the filter once the last provider is gone. */
export function releaseRefractionFilter(): void {
  if (refCount === 0) return
  refCount--
  if (refCount > 0) return
  host?.remove()
  host = null
  displacement = null
}

/** Introspection for tests. */
export function refractionFilterMounted(): boolean {
  return host !== null
}
