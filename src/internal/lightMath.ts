/**
 * Geometry of the element light model.
 *
 * Everything here is pure arithmetic on numbers. That is deliberate: jsdom has
 * no layout engine, so any module that reads a real rect cannot be tested
 * meaningfully. Keeping the maths apart means the interesting half of the
 * light engine is covered by ordinary unit tests, and the DOM half only has to
 * prove that it read before it wrote.
 */

/** The part of a DOMRect the model needs, in viewport pixels. */
export interface SurfaceRect {
  left: number
  top: number
  width: number
  height: number
}

/** Knobs shared by every surface. */
export interface LightTuning {
  /** Distance in pixels past a surface edge where the light stops reaching it. */
  falloff: number
  /** Virtual height of the light above the page plane, in pixels. */
  height: number
  /** Multiplier applied to the resulting energy. */
  gain: number
}

/** What a single surface needs in order to paint itself. */
export interface SurfaceLight {
  /** Horizontal light position as a percentage of the surface width. */
  u: number
  /** Vertical light position as a percentage of the surface height. */
  v: number
  /** Direction of the light in CSS gradient degrees, unwrapped across frames. */
  angle: number
  /** How strongly the light reaches this surface, from 0 to 1. */
  energy: number
  /** How square-on the light hits, from 0 (grazing) to 1 (straight above). */
  incidence: number
}

export const DEFAULT_TUNING: LightTuning = {
  falloff: 900,
  height: 520,
  gain: 1,
}

/**
 * What a surface shows before the registry has ever measured it, and what the
 * stylesheet declares as the plain fallback. Matches the initial-value of each
 * registered property in styles/props.css.
 */
export const RESTING_LIGHT: SurfaceLight = {
  u: 50,
  v: 28,
  angle: 0,
  energy: 1,
  incidence: 0.7,
}

function clamp01(n: number): number {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

/** Hermite ease used to soften the falloff. A linear ramp reads as plastic. */
export function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/**
 * Keeps an angle continuous across frames.
 *
 * atan2 returns a value in (-180, 180], so a light crossing the vertical above
 * a surface jumps from 179 to -179 between two frames. Nothing breaks while the
 * property is written raw, but --gt-light-angle is a registered <angle>, which
 * means it is interpolable: the moment anyone puts a transition on it, that
 * jump animates the long way round through 358 degrees. Accumulating whole
 * turns keeps consecutive values at most half a turn apart, so the shortest
 * path is always the right one.
 */
export function unwrapAngle(next: number, previous: number): number {
  const turns = Math.round((previous - next) / 360)
  return next + turns * 360
}

/**
 * Resolves the light for one surface.
 *
 * Positions come out as percentages rather than pixels because a percentage in
 * background-position resolves against the surface's own box. That makes the
 * result invariant to any scale applied by an ancestor: a modal panel at
 * scale(0.97) reports a smaller rect and the ratio is unchanged. Pixels would
 * need the accumulated ancestor matrix, which is far too expensive to read
 * every frame.
 *
 * Distance is measured from the nearest edge rather than from the centre. With
 * centre distance a wide card dims while the pointer is sitting on top of it,
 * which reads as a bug even though the arithmetic is right.
 */
export function computeSurfaceLight(
  rect: SurfaceRect,
  lightX: number,
  lightY: number,
  tuning: LightTuning = DEFAULT_TUNING,
  previousAngle = 0,
): SurfaceLight {
  // A collapsed or unlaid-out element has no meaningful geometry. jsdom
  // reports every rect as zero, so this is also the path tests take when they
  // do not stub a rect.
  if (!(rect.width > 0) || !(rect.height > 0)) {
    return { ...RESTING_LIGHT, angle: previousAngle }
  }

  const halfW = rect.width / 2
  const halfH = rect.height / 2
  const dx = lightX - (rect.left + halfW)
  const dy = lightY - (rect.top + halfH)

  const edgeX = Math.max(0, Math.abs(dx) - halfW)
  const edgeY = Math.max(0, Math.abs(dy) - halfH)
  const edgeDistance = Math.hypot(edgeX, edgeY)

  const falloff = tuning.falloff > 0 ? tuning.falloff : 1
  const energy = clamp01(smoothstep(1 - edgeDistance / falloff) * tuning.gain)

  const height = Math.max(0, tuning.height)
  const centreDistance = Math.hypot(dx, dy)
  const incidence = height > 0 ? height / Math.hypot(centreDistance, height) : 0

  // atan2(dx, -dy) lands directly on the CSS gradient convention: 0deg points
  // up and the angle grows clockwise, the same as linear-gradient reads it.
  // Sitting exactly on the centre there is no direction to report, and atan2
  // would answer 180deg purely because -0 counts as negative. Holding the last
  // angle keeps the rim still while the pointer crosses the middle.
  const rawAngle = centreDistance === 0 ? previousAngle : (Math.atan2(dx, -dy) * 180) / Math.PI

  return {
    u: ((lightX - rect.left) / rect.width) * 100,
    v: ((lightY - rect.top) / rect.height) * 100,
    angle: unwrapAngle(rawAngle, previousAngle),
    energy,
    incidence,
  }
}
