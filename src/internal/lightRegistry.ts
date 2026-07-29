/**
 * The element light registry.
 *
 * One animation frame loop drives every glass surface on the page. Each frame
 * runs three phases in a fixed order: read every rect, compute every result,
 * write every custom property. Interleaving reads and writes would force a
 * synchronous layout per pair, which is the classic way to make an effect like
 * this unusable; kept apart, the worst case is a single layout flush per frame.
 *
 * Surfaces the registry drives carry data-gt-lit, and the stylesheet keys the
 * element space recipe off that attribute. Anything the registry never saw
 * keeps the viewport space recipe from 0.1.0 untouched.
 */
import {
  computeSurfaceLight,
  DEFAULT_TUNING,
  type LightTuning,
  type SurfaceLight,
  type SurfaceRect,
} from './lightMath'

export interface RegisterOptions {
  /** Re-measure every frame. For surfaces that move under their own animation. */
  volatile?: boolean
  /** Multiplies the energy of this surface alone. */
  gain?: number
  /** Suspends the surface without releasing it. */
  enabled?: boolean
  /** Called after each write. The playground inspector reads the light here. */
  onUpdate?: (light: SurfaceLight) => void
}

export interface SurfaceHandle {
  update(patch: RegisterOptions): void
  measure(): void
  release(): void
}

const LIT_ATTR = 'data-gt-lit'

const PROPS = {
  u: '--gt-light-u',
  v: '--gt-light-v',
  angle: '--gt-light-angle',
  energy: '--gt-light-energy',
  incidence: '--gt-light-incidence',
} as const

/**
 * How far outside the viewport a surface is still tracked. Wide enough that a
 * surface is already correct by the time it scrolls into view. It cannot follow
 * the falloff, because rootMargin is fixed when the observer is constructed.
 */
const VIEWPORT_MARGIN = '400px'

/**
 * ResizeObserver does not fire when an ancestor moves a surface without
 * resizing it, and the platform has no position observer. A full re-measure on
 * this cadence, only while the loop is already running, covers that gap for one
 * rect read per visible surface every half second.
 */
const REVALIDATE_MS = 500

/**
 * Past this many surfaces in range at once the registry stops trying to keep up
 * and updates the nearest ones only. Degrading is the right answer for a
 * library that does not control the host page.
 */
const MAX_ACTIVE_SURFACES = 120

interface Surface {
  el: HTMLElement
  volatile: boolean
  gain: number
  enabled: boolean
  onUpdate?: (light: SurfaceLight) => void
  rect: SurfaceRect
  needsMeasure: boolean
  visible: boolean
  angle: number
  /** Depth of running transform transitions or animations on this element. */
  busy: number
  /** Frames still to re-measure after a transform settled. */
  settle: number
  /** Last string written per property, so identical writes are skipped. */
  written: Partial<Record<keyof typeof PROPS, string>>
  detach: () => void
}

/** Produces a light position from the frame clock, or null to hold the last one. */
export type LightDriver = (now: number) => { x: number; y: number } | null

const surfaces = new Map<HTMLElement, Surface>()
let tuning: LightTuning = { ...DEFAULT_TUNING }
let driver: LightDriver | null = null

let lightX = 0
let lightY = 0
let hasLight = false
let lightMoved = false
let geometryDirty = false

let rafId = 0
let scheduled = false
let lastRevalidate = 0
let listening = false
let capWarned = false

/** Last viewport space pair written to <html>, so repeats are skipped. */
let globalX = ''
let globalY = ''
let globalWritten = false

let resizeObserver: ResizeObserver | null = null
let viewportObserver: IntersectionObserver | null = null

/* ------------------------------------------------------------------ */
/* Capabilities                                                        */
/* ------------------------------------------------------------------ */

function mediaMatches(query: string): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

/**
 * Whether the loop may run at all. Under either reduced preference the registry
 * still does a single pass, so every surface gets a highlight consistent with
 * where it actually sits. It just never animates.
 */
function motionAllowed(): boolean {
  return (
    !mediaMatches('(prefers-reduced-motion: reduce)') &&
    !mediaMatches('(prefers-reduced-transparency: reduce)')
  )
}

/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

function schedule(): void {
  if (typeof window === 'undefined' || scheduled) return
  // A page can have a provider and no registered surfaces at all, if every
  // piece of glass on it is hand written. The loop still has to run, because
  // it is what publishes the viewport space pair those surfaces read.
  if (surfaces.size === 0 && !hasLight) return
  scheduled = true
  rafId = window.requestAnimationFrame(frame)
}

/** Whether the loop has a reason to run again after the pass that just ended. */
function needsAnotherFrame(): boolean {
  if (!motionAllowed()) return false
  if (driver) return true
  if (lightMoved || geometryDirty) return true
  for (const surface of surfaces.values()) {
    if (surface.enabled && (surface.volatile || surface.busy > 0 || surface.settle > 0)) return true
  }
  return false
}

function frame(now: number): void {
  scheduled = false
  rafId = 0
  runPass(now)
  if (needsAnotherFrame()) schedule()
}

function stopLoop(): void {
  if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId)
  rafId = 0
  scheduled = false
}

/* ------------------------------------------------------------------ */
/* The pass                                                            */
/* ------------------------------------------------------------------ */

function resolveLight(): { x: number; y: number } {
  if (hasLight) return { x: lightX, y: lightY }
  // Matches the --gt-light-x and --gt-light-y defaults in tokens.css, so a page
  // with no provider and a page with a silent one look the same.
  const width = typeof window === 'undefined' ? 0 : window.innerWidth
  const height = typeof window === 'undefined' ? 0 : window.innerHeight
  return { x: width * 0.5, y: height * 0.28 }
}

function runPass(now: number): void {
  // A driver generates a position from the clock. The provider hands one over
  // for its drift mode, so a touch device gets a wandering light without
  // opening a second animation loop to produce it.
  if (driver) {
    const point = driver(now)
    if (point) {
      lightX = point.x
      lightY = point.y
      hasLight = true
      lightMoved = true
    }
  }

  const moved = lightMoved
  const dirty = geometryDirty
  lightMoved = false
  geometryDirty = false

  if (now - lastRevalidate > REVALIDATE_MS) {
    lastRevalidate = now
    for (const surface of surfaces.values()) {
      if (surface.visible) surface.needsMeasure = true
    }
  }

  // Phase 1: read. Every rect first, so at most one layout flush happens.
  let remeasured = false
  for (const surface of surfaces.values()) {
    if (!surface.enabled || !surface.visible) continue
    const moving = surface.volatile || surface.busy > 0 || surface.settle > 0
    if (!surface.needsMeasure && !moving) continue
    const rect = surface.el.getBoundingClientRect()
    surface.rect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    surface.needsMeasure = false
    remeasured = true
    if (surface.settle > 0) surface.settle--
  }

  // A volatile surface changes shape without anything flagging it, so a fresh
  // measurement counts as a reason to repaint on its own.
  if (!moved && !dirty && !remeasured) return

  const { x, y } = resolveLight()

  // Phase 3a: publish the viewport space pair. Kept here rather than in the
  // provider so it happens after every rect has been read: writing an inherited
  // custom property on <html> invalidates the whole tree, and a rect read after
  // that would force a synchronous layout.
  publishGlobalLight()

  // Phase 2: compute.
  const active: Surface[] = []
  for (const surface of surfaces.values()) {
    if (surface.enabled && surface.visible) active.push(surface)
  }

  let painted = active
  if (active.length > MAX_ACTIVE_SURFACES) {
    painted = active
      .map((surface) => ({
        surface,
        distance: Math.hypot(
          x - (surface.rect.left + surface.rect.width / 2),
          y - (surface.rect.top + surface.rect.height / 2),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_ACTIVE_SURFACES)
      .map((entry) => entry.surface)

    if (!capWarned) {
      capWarned = true
      console.warn(
        `[glasstora] ${active.length} glass surfaces are in view. ` +
          `Only the ${MAX_ACTIVE_SURFACES} nearest ones follow the light; the rest hold still.`,
      )
    }
  }

  const results: SurfaceLight[] = painted.map((surface) => {
    const light = computeSurfaceLight(
      surface.rect,
      x,
      y,
      surface.gain === 1 ? tuning : { ...tuning, gain: tuning.gain * surface.gain },
      surface.angle,
    )
    surface.angle = light.angle
    return light
  })

  // Phase 3b: write each surface.
  for (let i = 0; i < painted.length; i++) write(painted[i], results[i])
}

/**
 * Keeps --gt-light-x and --gt-light-y on <html> in step with the source.
 *
 * These are the 0.1.0 contract: every .gt-glass the registry never saw still
 * reads them, and so does anything a consumer built on top of them. Nothing
 * about them changes in 0.2.0.
 */
function publishGlobalLight(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (!hasLight) {
    if (globalWritten) {
      root.style.removeProperty('--gt-light-x')
      root.style.removeProperty('--gt-light-y')
      globalWritten = false
    }
    return
  }

  const x = `${Math.round(lightX)}px`
  const y = `${Math.round(lightY)}px`
  if (x !== globalX) {
    root.style.setProperty('--gt-light-x', x)
    globalX = x
  }
  if (y !== globalY) {
    root.style.setProperty('--gt-light-y', y)
    globalY = y
  }
  globalWritten = true
}

/**
 * Writes the five properties, with two cuts that decide whether this scales.
 *
 * At zero energy every gradient is fully transparent, so the other four values
 * are invisible and stop being written. That caps the per frame cost by the
 * area the light reaches rather than by how much glass the page contains: a
 * page with 500 surfaces costs the same as one with 20.
 *
 * The rest is quantisation. Values are rounded to the smallest step that is
 * still visible and compared against the last string written, so a slow pointer
 * leaves most surfaces untouched on most frames.
 */
function write(surface: Surface, light: SurfaceLight): void {
  const style = surface.el.style
  const written = surface.written

  const energy = light.energy.toFixed(3)
  if (written.energy !== energy) {
    style.setProperty(PROPS.energy, energy)
    written.energy = energy
  }

  if (light.energy <= 0) return

  const u = `${light.u.toFixed(1)}%`
  if (written.u !== u) {
    style.setProperty(PROPS.u, u)
    written.u = u
  }

  const v = `${light.v.toFixed(1)}%`
  if (written.v !== v) {
    style.setProperty(PROPS.v, v)
    written.v = v
  }

  const angle = `${light.angle.toFixed(1)}deg`
  if (written.angle !== angle) {
    style.setProperty(PROPS.angle, angle)
    written.angle = angle
  }

  const incidence = light.incidence.toFixed(3)
  if (written.incidence !== incidence) {
    style.setProperty(PROPS.incidence, incidence)
    written.incidence = incidence
  }

  surface.onUpdate?.(light)
}

function clearProperties(el: HTMLElement): void {
  for (const name of Object.values(PROPS)) el.style.removeProperty(name)
}

/* ------------------------------------------------------------------ */
/* Observers and listeners                                             */
/* ------------------------------------------------------------------ */

function markAll(): void {
  for (const surface of surfaces.values()) surface.needsMeasure = true
  geometryDirty = true
}

function onScrollOrResize(): void {
  markAll()
  schedule()
}

function ensureListening(): void {
  if (listening || typeof window === 'undefined') return
  listening = true

  // Capture phase, so scrolling inside any container is caught without having
  // to walk each surface's ancestor chain looking for scroll parents.
  document.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true })
  window.addEventListener('resize', onScrollOrResize, { passive: true })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const surface = surfaces.get(entry.target as HTMLElement)
        if (surface) surface.needsMeasure = true
      }
      geometryDirty = true
      schedule()
    })
  }

  if (typeof IntersectionObserver !== 'undefined') {
    viewportObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const surface = surfaces.get(entry.target as HTMLElement)
          if (!surface) continue
          surface.visible = entry.isIntersecting
          if (entry.isIntersecting) surface.needsMeasure = true
        }
        geometryDirty = true
        schedule()
      },
      { rootMargin: VIEWPORT_MARGIN, threshold: 0 },
    )
  }
}

function stopListening(): void {
  if (!listening || typeof window === 'undefined') return
  listening = false
  document.removeEventListener('scroll', onScrollOrResize, { capture: true })
  window.removeEventListener('resize', onScrollOrResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  viewportObserver?.disconnect()
  viewportObserver = null
}

/**
 * Transform transitions and animations move a surface without resizing it, so
 * nothing else would notice. Only transform is watched: every interactive glass
 * surface transitions its colours on hover, and re-measuring for those would
 * keep the loop awake for no reason.
 *
 * Transitions started by an ancestor fire on the ancestor and bubble upwards,
 * never down here, so those still need the explicit volatile option.
 */
function watchTransforms(surface: Surface): () => void {
  const el = surface.el

  // Checked by shape rather than by instanceof, because jsdom does not define
  // TransitionEvent and the reference alone would throw.
  const isOtherProperty = (event: Event) =>
    event.type.startsWith('transition') &&
    (event as TransitionEvent).propertyName !== undefined &&
    (event as TransitionEvent).propertyName !== 'transform'

  const start = (event: Event) => {
    if (event.target !== el || isOtherProperty(event)) return
    surface.busy++
    schedule()
  }

  const stop = (event: Event) => {
    if (event.target !== el || isOtherProperty(event)) return
    surface.busy = Math.max(0, surface.busy - 1)
    // A couple of frames past the end, so the settled rect is the one stored.
    surface.settle = 2
    schedule()
  }

  el.addEventListener('transitionrun', start)
  el.addEventListener('animationstart', start)
  el.addEventListener('transitionend', stop)
  el.addEventListener('transitioncancel', stop)
  el.addEventListener('animationend', stop)
  el.addEventListener('animationcancel', stop)

  return () => {
    el.removeEventListener('transitionrun', start)
    el.removeEventListener('animationstart', start)
    el.removeEventListener('transitionend', stop)
    el.removeEventListener('transitioncancel', stop)
    el.removeEventListener('animationend', stop)
    el.removeEventListener('animationcancel', stop)
  }
}

/* ------------------------------------------------------------------ */
/* Public surface                                                      */
/* ------------------------------------------------------------------ */

/** Puts an element under the light. Returns the handle used to let it go. */
export function registerSurface(el: HTMLElement, options: RegisterOptions = {}): SurfaceHandle {
  const existing = surfaces.get(el)
  if (existing) {
    Object.assign(existing, stripUndefined(options))
    existing.needsMeasure = true
    geometryDirty = true
    schedule()
    return makeHandle(existing)
  }

  const surface: Surface = {
    el,
    volatile: options.volatile ?? false,
    gain: options.gain ?? 1,
    enabled: options.enabled ?? true,
    onUpdate: options.onUpdate,
    rect: { left: 0, top: 0, width: 0, height: 0 },
    needsMeasure: true,
    // Visible until an observer says otherwise. Without that default the whole
    // effect would depend on IntersectionObserver existing, and every surface
    // would sit dark in environments that lack it.
    visible: true,
    angle: 0,
    busy: 0,
    settle: 0,
    written: {},
    detach: () => {},
  }

  surfaces.set(el, surface)
  el.setAttribute(LIT_ATTR, '')

  ensureListening()
  resizeObserver?.observe(el)
  viewportObserver?.observe(el)
  surface.detach = watchTransforms(surface)

  geometryDirty = true
  schedule()

  return makeHandle(surface)
}

function stripUndefined(options: RegisterOptions): RegisterOptions {
  const patch: RegisterOptions = {}
  if (options.volatile !== undefined) patch.volatile = options.volatile
  if (options.gain !== undefined) patch.gain = options.gain
  if (options.enabled !== undefined) patch.enabled = options.enabled
  if (options.onUpdate !== undefined) patch.onUpdate = options.onUpdate
  return patch
}

function makeHandle(surface: Surface): SurfaceHandle {
  return {
    update(patch) {
      Object.assign(surface, stripUndefined(patch))
      surface.needsMeasure = true
      geometryDirty = true
      schedule()
    },
    measure() {
      surface.needsMeasure = true
      geometryDirty = true
      schedule()
    },
    release() {
      if (!surfaces.has(surface.el)) return
      surface.detach()
      resizeObserver?.unobserve(surface.el)
      viewportObserver?.unobserve(surface.el)
      surface.el.removeAttribute(LIT_ATTR)
      clearProperties(surface.el)
      surfaces.delete(surface.el)
      if (surfaces.size === 0) {
        stopListening()
        // The provider may well still be mounted, so the light source stays and
        // the loop keeps publishing the viewport space pair for hand written
        // glass. Only the per surface work goes away.
        if (!hasLight) stopLoop()
      }
    },
  }
}

/**
 * Installs a per frame source of light positions, or removes it with null.
 *
 * Returning null from the driver leaves the light wherever it was, which is how
 * the provider suspends its drift while a consumer holds the light with set().
 */
export function setLightDriver(fn: LightDriver | null): void {
  driver = fn
  if (!fn) return
  lightMoved = true
  schedule()
}

/** Moves the global light. The provider calls this, nothing else needs to. */
export function setLightSource(x: number, y: number): void {
  if (hasLight && x === lightX && y === lightY) return
  lightX = x
  lightY = y
  hasLight = true
  lightMoved = true
  schedule()
}

/** Forgets the light source, so surfaces fall back to the resting position. */
export function clearLightSource(): void {
  if (!hasLight) return
  hasLight = false
  lightMoved = true
  // Done here rather than in the pass, because with no surfaces registered
  // there may be no pass left to run.
  publishGlobalLight()
  schedule()
}

/** Adjusts the shared falloff, height and gain. */
export function configureLight(patch: Partial<LightTuning>): void {
  tuning = { ...tuning, ...patch }
  markAll()
  schedule()
}

export function getLightTuning(): LightTuning {
  return { ...tuning }
}

/** Number of surfaces currently registered. Introspection for tests and demos. */
export function surfaceCount(): number {
  return surfaces.size
}

/** Tears the registry down. Only used to isolate tests. */
export function resetLightRegistry(): void {
  for (const surface of [...surfaces.values()]) {
    surface.detach()
    surface.el.removeAttribute(LIT_ATTR)
    clearProperties(surface.el)
  }
  surfaces.clear()
  stopLoop()
  stopListening()
  tuning = { ...DEFAULT_TUNING }
  driver = null
  hasLight = false
  publishGlobalLight()
  globalX = ''
  globalY = ''
  lightMoved = false
  geometryDirty = false
  lastRevalidate = 0
  capWarned = false
}

export type { LightTuning, SurfaceLight }
