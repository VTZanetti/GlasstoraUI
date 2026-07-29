import { describe, expect, it } from 'vitest'
import {
  computeSurfaceLight,
  DEFAULT_TUNING,
  RESTING_LIGHT,
  unwrapAngle,
  type LightTuning,
} from '../internal/lightMath'

const SQUARE = { left: 0, top: 0, width: 100, height: 100 }

function tuning(patch: Partial<LightTuning> = {}): LightTuning {
  return { ...DEFAULT_TUNING, ...patch }
}

describe('computeSurfaceLight', () => {
  it('maps a light at the element centre to fifty percent on both axes', () => {
    const light = computeSurfaceLight({ left: 40, top: 80, width: 200, height: 60 }, 140, 110)
    expect(light.u).toBeCloseTo(50)
    expect(light.v).toBeCloseTo(50)
  })

  it('places the hotspot on the light after an ancestor scale', () => {
    // The modal panel animates in at scale(0.97). getBoundingClientRect reports
    // the scaled box, while the browser resolves a background percentage
    // against the unscaled one and then maps it through the transform. The two
    // have to meet on the same screen pixel.
    const box = { left: 100, top: 50, width: 200, height: 120 }
    const scale = 0.97
    const centreX = box.left + box.width / 2
    const centreY = box.top + box.height / 2
    const scaled = {
      left: centreX - (box.width * scale) / 2,
      top: centreY - (box.height * scale) / 2,
      width: box.width * scale,
      height: box.height * scale,
    }

    const lightX = 150
    const lightY = 40
    const { u, v } = computeSurfaceLight(scaled, lightX, lightY)

    const localX = box.left + (u / 100) * box.width
    const localY = box.top + (v / 100) * box.height
    expect(centreX + (localX - centreX) * scale).toBeCloseTo(lightX, 6)
    expect(centreY + (localY - centreY) * scale).toBeCloseTo(lightY, 6)
  })

  it('returns zero degrees when the light sits directly above the element', () => {
    expect(computeSurfaceLight(SQUARE, 50, -500).angle).toBeCloseTo(0)
  })

  it('points the angle at the light, following the CSS gradient convention', () => {
    // 90deg in a linear-gradient runs left to right, so a light on the right
    // has to report 90deg for the bright end to land on the right edge.
    expect(computeSurfaceLight(SQUARE, 900, 50).angle).toBeCloseTo(90)
    expect(computeSurfaceLight(SQUARE, -900, 50).angle).toBeCloseTo(-90)
  })

  it('measures distance from the nearest edge, not from the centre', () => {
    // A 900px wide card with the pointer resting on its far end. Measured from
    // the centre this is 430px away and would dim; measured from the edge the
    // light is touching the surface and should be at full strength.
    const wide = { left: 0, top: 0, width: 900, height: 100 }
    const light = computeSurfaceLight(wide, 880, 50, tuning({ falloff: 200 }))
    expect(light.energy).toBe(1)
  })

  it('clamps energy to zero beyond the falloff radius', () => {
    const light = computeSurfaceLight(SQUARE, 2000, 50, tuning({ falloff: 400 }))
    expect(light.energy).toBe(0)
  })

  it('eases the falloff instead of ramping it linearly', () => {
    const falloff = 400
    // Halfway out, a linear ramp would read exactly 0.5.
    const light = computeSurfaceLight(SQUARE, 50 + 50 + falloff / 2, 50, tuning({ falloff }))
    expect(light.energy).toBeCloseTo(0.5)
    const quarter = computeSurfaceLight(SQUARE, 50 + 50 + falloff / 4, 50, tuning({ falloff }))
    expect(quarter.energy).toBeGreaterThan(0.75)
  })

  it('raises incidence as the light approaches the surface', () => {
    const overhead = computeSurfaceLight(SQUARE, 50, 50, tuning({ height: 500 }))
    const grazing = computeSurfaceLight(SQUARE, 2000, 50, tuning({ height: 500 }))
    expect(overhead.incidence).toBeCloseTo(1)
    expect(grazing.incidence).toBeLessThan(0.3)
  })

  it('holds the previous angle while the light sits exactly on the centre', () => {
    // There is no direction to report from zero distance, and atan2 would
    // answer 180deg only because negative zero counts as a negative x.
    expect(computeSurfaceLight(SQUARE, 50, 50, DEFAULT_TUNING, 34).angle).toBe(34)
    expect(computeSurfaceLight(SQUARE, 50, 50).angle).toBe(0)
  })

  it('falls back to the resting values for a zero sized rect', () => {
    const light = computeSurfaceLight({ left: 0, top: 0, width: 0, height: 0 }, 10, 10)
    expect(light.u).toBe(RESTING_LIGHT.u)
    expect(light.v).toBe(RESTING_LIGHT.v)
    expect(light.energy).toBe(RESTING_LIGHT.energy)
    expect(Number.isFinite(light.incidence)).toBe(true)
  })

  it('unwraps the angle so consecutive frames never jump more than half a turn', () => {
    // Two frames of a light passing under the surface, either side of the
    // vertical. The raw values sit at opposite ends of the atan2 range.
    const below = { left: 0, top: 0, width: 100, height: 100 }
    const first = computeSurfaceLight(below, 49, 1100)
    const second = computeSurfaceLight(below, 51, 1100, DEFAULT_TUNING, first.angle)

    const rawSecond = computeSurfaceLight(below, 51, 1100)
    expect(Math.abs(rawSecond.angle - first.angle)).toBeGreaterThan(300)
    expect(Math.abs(second.angle - first.angle)).toBeLessThan(1)
  })
})

describe('unwrapAngle', () => {
  it('leaves an angle alone when it is already the nearest equivalent', () => {
    expect(unwrapAngle(12, 10)).toBe(12)
  })

  it('adds a turn rather than winding the long way round', () => {
    expect(unwrapAngle(-179, 179)).toBe(181)
    expect(unwrapAngle(179, -179)).toBe(-181)
  })

  it('keeps accumulating across several turns', () => {
    expect(unwrapAngle(10, 730)).toBe(730)
  })
})
