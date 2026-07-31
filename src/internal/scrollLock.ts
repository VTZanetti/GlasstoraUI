/**
 * Holds the page still while a layer is open.
 *
 * Counted, because a drawer opened from inside a modal must not hand the page
 * back when it closes. The first lock records what was there and the last one
 * puts it back; the ones in between only move the count.
 */

let locks = 0
let previousOverflow = ''
let previousPaddingRight = ''

/** Locks the page and returns the release. Calling the release twice is safe. */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}

  const root = document.documentElement

  if (locks === 0) {
    previousOverflow = root.style.overflow
    previousPaddingRight = root.style.paddingRight
    // Measured before the lock, since hiding the bar changes clientWidth. The
    // page would otherwise jump sideways by the width of the scrollbar.
    const scrollbarGap = window.innerWidth - root.clientWidth
    if (scrollbarGap > 0) root.style.paddingRight = `${scrollbarGap}px`
    root.style.overflow = 'hidden'
  }

  locks += 1
  let released = false

  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks > 0) return
    root.style.overflow = previousOverflow
    root.style.paddingRight = previousPaddingRight
  }
}

/** How many layers are holding the page. Exposed for tests. */
export function scrollLockCount(): number {
  return locks
}

/** Drops every lock and restores the page. For tests, between cases. */
export function resetScrollLock(): void {
  if (locks > 0 && typeof document !== 'undefined') {
    document.documentElement.style.overflow = previousOverflow
    document.documentElement.style.paddingRight = previousPaddingRight
  }
  locks = 0
  previousOverflow = ''
  previousPaddingRight = ''
}
