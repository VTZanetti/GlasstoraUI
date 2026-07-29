import { describe, expect, it } from 'vitest'
import { computeFloatingPosition, type FloatingOptions } from '../internal/floatingMath'
import type { GlassPlacement } from '../types'

const VIEWPORT = { width: 1000, height: 800 }
const PANEL = { width: 200, height: 100 }

function options(placement: GlassPlacement, patch: Partial<FloatingOptions> = {}): FloatingOptions {
  return { placement, offset: 8, padding: 8, ...patch }
}

describe('computeFloatingPosition', () => {
  it('places a bottom panel below the anchor', () => {
    const anchor = { left: 400, top: 300, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom'))
    expect(result.y).toBe(348)
    expect(result.x).toBe(400 + 50 - 100)
    expect(result.placement).toBe('bottom')
  })

  it('aligns to the anchor edges for the start and end variants', () => {
    const anchor = { left: 400, top: 300, width: 100, height: 40 }
    expect(computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom-start')).x).toBe(400)
    expect(computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom-end')).x).toBe(300)
  })

  it('flips to the top placement when the bottom overflows the viewport', () => {
    const anchor = { left: 400, top: 740, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom'))
    expect(result.placement).toBe('top')
    expect(result.y).toBe(740 - 100 - 8)
  })

  it('keeps the requested side when flipping would be worse', () => {
    // Taller than the viewport, so neither side fits. Anchored near the top,
    // flipping up would push far more of the panel off screen than staying.
    const tall = { width: 200, height: 900 }
    const anchor = { left: 400, top: 10, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, tall, VIEWPORT, options('bottom'))
    expect(result.placement).toBe('bottom')
  })

  it('takes the lesser overflow when neither side fits', () => {
    const tall = { width: 200, height: 900 }
    const anchor = { left: 400, top: 400, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, tall, VIEWPORT, options('bottom'))
    expect(result.placement).toBe('top')
  })

  it('shifts along the cross axis instead of overflowing sideways', () => {
    const anchor = { left: 960, top: 300, width: 30, height: 30 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom'))
    expect(result.x).toBe(VIEWPORT.width - PANEL.width - 8)
    expect(result.placement).toBe('bottom')
  })

  it('never shifts along the main axis, which would detach the panel', () => {
    const anchor = { left: 400, top: 300, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom'))
    expect(result.y).toBe(anchor.top + anchor.height + 8)
  })

  it('centres a side placement on the anchor', () => {
    const anchor = { left: 400, top: 300, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('right'))
    expect(result.x).toBe(508)
    expect(result.y).toBe(300 + 20 - 50)
  })

  it('flips right to left against the viewport edge', () => {
    const anchor = { left: 940, top: 300, width: 50, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('right'))
    expect(result.placement).toBe('left')
    expect(result.x).toBe(940 - 200 - 8)
  })

  it('preserves the alignment through a flip', () => {
    const anchor = { left: 400, top: 740, width: 100, height: 40 }
    const result = computeFloatingPosition(anchor, PANEL, VIEWPORT, options('bottom-start'))
    expect(result.placement).toBe('top-start')
  })
})
