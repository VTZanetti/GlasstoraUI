import type { GlassPlacement } from '../types'

/**
 * Placement arithmetic for the floating layer.
 *
 * Pure numbers, like lightMath and for the same reason: jsdom has no layout, so
 * this is the only part of the floating layer that can be covered properly.
 *
 * Everything is in viewport coordinates. The floating element is positioned
 * with position: fixed and teleported to the body, which is what makes that
 * safe: fixed coordinates are viewport coordinates, no ancestor can turn the
 * element into something else's containing block, and collision only has to be
 * checked against the viewport instead of every clipping ancestor on the way up.
 */

export interface FloatingRect {
  left: number
  top: number
  width: number
  height: number
}

export interface FloatingSize {
  width: number
  height: number
}

export interface FloatingOptions {
  placement: GlassPlacement
  /** Gap between the anchor and the panel, in pixels. */
  offset: number
  /** Smallest distance the panel may sit from a viewport edge. */
  padding: number
}

export interface FloatingResult {
  x: number
  y: number
  /** The placement actually used, which is not the requested one after a flip. */
  placement: GlassPlacement
}

type Side = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'end' | 'center'

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function split(placement: GlassPlacement): { side: Side; align: Align } {
  const [side, align] = placement.split('-') as [Side, Align | undefined]
  return { side, align: align ?? 'center' }
}

function join(side: Side, align: Align): GlassPlacement {
  return (align === 'center' ? side : `${side}-${align}`) as GlassPlacement
}

function place(
  side: Side,
  align: Align,
  anchor: FloatingRect,
  size: FloatingSize,
  offset: number,
): { x: number; y: number } {
  if (side === 'top' || side === 'bottom') {
    const y =
      side === 'top' ? anchor.top - size.height - offset : anchor.top + anchor.height + offset
    const x =
      align === 'start'
        ? anchor.left
        : align === 'end'
          ? anchor.left + anchor.width - size.width
          : anchor.left + anchor.width / 2 - size.width / 2
    return { x, y }
  }

  const x =
    side === 'left' ? anchor.left - size.width - offset : anchor.left + anchor.width + offset
  const y = anchor.top + anchor.height / 2 - size.height / 2
  return { x, y }
}

/** How far the panel pokes out of the viewport on the side it was placed on. */
function overflow(
  side: Side,
  point: { x: number; y: number },
  size: FloatingSize,
  viewport: FloatingSize,
  padding: number,
): number {
  if (side === 'top') return padding - point.y
  if (side === 'bottom') return point.y + size.height - (viewport.height - padding)
  if (side === 'left') return padding - point.x
  return point.x + size.width - (viewport.width - padding)
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Resolves where a floating panel goes.
 *
 * Two corrections, in the order they matter. Flip moves the panel to the
 * opposite side when the requested one has no room, and keeps the side with
 * more room if neither fits. Shift then slides it along the cross axis so it
 * stays inside the viewport without leaving the anchor.
 */
export function computeFloatingPosition(
  anchor: FloatingRect,
  size: FloatingSize,
  viewport: FloatingSize,
  options: FloatingOptions,
): FloatingResult {
  const { side, align } = split(options.placement)
  const { offset, padding } = options

  let chosen = side
  let point = place(side, align, anchor, size, offset)

  const spill = overflow(side, point, size, viewport, padding)
  if (spill > 0) {
    const flipped = OPPOSITE[side]
    const flippedPoint = place(flipped, align, anchor, size, offset)
    const flippedSpill = overflow(flipped, flippedPoint, size, viewport, padding)
    if (flippedSpill < spill) {
      chosen = flipped
      point = flippedPoint
    }
  }

  // Shift on the cross axis only. Moving along the main axis would detach the
  // panel from its anchor, which is worse than a little overflow.
  const x =
    chosen === 'left' || chosen === 'right'
      ? point.x
      : clamp(point.x, padding, viewport.width - size.width - padding)
  const y =
    chosen === 'top' || chosen === 'bottom'
      ? point.y
      : clamp(point.y, padding, viewport.height - size.height - padding)

  return { x, y, placement: join(chosen, align) }
}
