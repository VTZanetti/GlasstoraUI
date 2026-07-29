/**
 * Test doubles for the browser APIs the light engine depends on.
 *
 * jsdom implements none of them in a form the registry can be driven by: there
 * is no layout, so every rect is zero, and neither observer exists. These
 * replacements are controllable rather than inert, so a test can move the
 * viewport, resize a surface or step the animation loop one frame at a time.
 */

type MediaListener = (event: MediaQueryListEvent) => void

const mediaMatches = new Map<string, boolean>()
const mediaListeners = new Map<string, Set<MediaListener>>()

/** Flips a media query and notifies whatever is listening for the change. */
export function setMediaQuery(query: string, matches: boolean): void {
  mediaMatches.set(query, matches)
  const listeners = mediaListeners.get(query)
  if (!listeners) return
  const event = { matches, media: query } as MediaQueryListEvent
  for (const listener of [...listeners]) listener(event)
}

export function resetMediaQueries(): void {
  mediaMatches.clear()
}

function fakeMatchMedia(query: string): MediaQueryList {
  let listeners = mediaListeners.get(query)
  if (!listeners) {
    listeners = new Set<MediaListener>()
    mediaListeners.set(query, listeners)
  }
  const set = listeners
  return {
    get matches() {
      return mediaMatches.get(query) ?? false
    },
    media: query,
    onchange: null,
    addListener: (listener: MediaListener) => set.add(listener),
    removeListener: (listener: MediaListener) => set.delete(listener),
    addEventListener: (_type: string, listener: MediaListener) => set.add(listener),
    removeEventListener: (_type: string, listener: MediaListener) => set.delete(listener),
    dispatchEvent: () => false,
  } as unknown as MediaQueryList
}

/* ------------------------------------------------------------------ */
/* Observers                                                           */
/* ------------------------------------------------------------------ */

interface FakeObserver {
  targets: Set<Element>
  callback: (entries: unknown[], observer: unknown) => void
}

const resizeObservers: FakeObserver[] = []
const viewportObservers: FakeObserver[] = []

function defineObserver(pool: FakeObserver[]) {
  return class {
    targets = new Set<Element>()
    callback: (entries: unknown[], observer: unknown) => void

    constructor(callback: (entries: unknown[], observer: unknown) => void) {
      this.callback = callback
      pool.push(this)
    }

    observe(el: Element) {
      this.targets.add(el)
    }

    unobserve(el: Element) {
      this.targets.delete(el)
    }

    disconnect() {
      this.targets.clear()
      const index = pool.indexOf(this)
      if (index >= 0) pool.splice(index, 1)
    }

    takeRecords() {
      return []
    }
  }
}

/** Fires the resize callback for a target, as a real ResizeObserver would. */
export function triggerResize(target: Element): void {
  for (const observer of [...resizeObservers]) {
    if (observer.targets.has(target)) observer.callback([{ target }], observer)
  }
}

/** Moves a target in or out of the observed viewport. */
export function triggerIntersection(target: Element, isIntersecting: boolean): void {
  for (const observer of [...viewportObservers]) {
    if (observer.targets.has(target)) observer.callback([{ target, isIntersecting }], observer)
  }
}

/* ------------------------------------------------------------------ */
/* Animation frames                                                    */
/* ------------------------------------------------------------------ */

const frameCallbacks = new Map<number, FrameRequestCallback>()
let nextFrameId = 1
let clock = 0

/**
 * Runs the frames that are currently pending. Callbacks queued during a frame
 * land in the next one, which is what makes it possible to assert that the loop
 * parks itself instead of rescheduling forever.
 */
export function flushFrames(count = 1, step = 16): void {
  for (let i = 0; i < count; i++) {
    const pending = [...frameCallbacks.values()]
    frameCallbacks.clear()
    clock += step
    for (const callback of pending) callback(clock)
  }
}

/** How many frames the loop has queued. Zero means it parked. */
export function pendingFrames(): number {
  return frameCallbacks.size
}

export function resetFrames(): void {
  frameCallbacks.clear()
  clock = 0
}

/** Moves the fake clock without running anything, to reach a time threshold. */
export function advanceClock(ms: number): void {
  clock += ms
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Gives an element a rect, since jsdom reports every box as zero sized. */
export function stubRect(el: Element, rect: Partial<DOMRect>): void {
  const box = {
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ...rect,
  }
  const full = {
    ...box,
    right: box.left + box.width,
    bottom: box.top + box.height,
  }
  el.getBoundingClientRect = () => ({ ...full, toJSON: () => full }) as DOMRect
}

/* ------------------------------------------------------------------ */
/* Installation                                                        */
/* ------------------------------------------------------------------ */

export function installTestDoubles(): void {
  window.matchMedia = fakeMatchMedia as unknown as typeof window.matchMedia

  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    const id = nextFrameId++
    frameCallbacks.set(id, callback)
    return id
  }) as typeof window.requestAnimationFrame

  window.cancelAnimationFrame = ((id: number) => {
    frameCallbacks.delete(id)
  }) as typeof window.cancelAnimationFrame

  window.ResizeObserver = defineObserver(resizeObservers) as unknown as typeof ResizeObserver
  window.IntersectionObserver = defineObserver(
    viewportObservers,
  ) as unknown as typeof IntersectionObserver

  globalThis.ResizeObserver = window.ResizeObserver
  globalThis.IntersectionObserver = window.IntersectionObserver
}
