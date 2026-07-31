import { readonly, ref } from 'vue'
import type { GlassToastOptions } from '../types'

export interface ToastEntry extends GlassToastOptions {
  id: number
}

/** Milliseconds a toast stays up when the caller names no duration. */
const DEFAULT_DURATION = 4000

/**
 * The queue, oldest first.
 *
 * Module scope rather than provide/inject, the way the light registry is: a
 * toast is raised from a store action, an interceptor or a plain function as
 * often as from a component, and inject() only works inside setup. One queue
 * per page is also what the outlet needs to be able to render all of them.
 */
const toasts = ref<ToastEntry[]>([])
const publicToasts = readonly(toasts)

let nextId = 0

interface Countdown {
  /** Undefined while the countdown is held. */
  handle: ReturnType<typeof setTimeout> | undefined
  /** Milliseconds still to run. */
  remaining: number
  /** When the current run started, to work out what it has spent. */
  startedAt: number
}

const countdowns = new Map<number, Countdown>()
let paused = false

/**
 * The timers live here rather than in the outlet.
 *
 * A toast that unmounts mid transition, an outlet that is replaced, a queue
 * read with no outlet mounted at all: in every one of those the component is
 * the wrong owner for the clock. Here the entry and its countdown are created
 * and dropped together.
 */
function run(id: number, countdown: Countdown) {
  countdown.startedAt = Date.now()
  countdown.handle = setTimeout(() => dismiss(id), countdown.remaining)
}

function arm(id: number, duration: number) {
  const countdown: Countdown = { handle: undefined, remaining: duration, startedAt: Date.now() }
  countdowns.set(id, countdown)
  // A toast raised while the pointer is resting on the stack waits with the
  // rest of them, instead of being the one that vanishes under the cursor.
  if (!paused) run(id, countdown)
}

function disarm(id: number) {
  const countdown = countdowns.get(id)
  if (!countdown) return
  if (countdown.handle !== undefined) clearTimeout(countdown.handle)
  countdowns.delete(id)
}

/** Raises a toast and returns its id. */
function show(options: GlassToastOptions): number {
  const id = ++nextId
  toasts.value.push({ ...options, id })
  const duration = options.duration ?? DEFAULT_DURATION
  if (duration > 0) arm(id, duration)
  return id
}

/** Takes one toast down. Unknown ids are ignored. */
function dismiss(id: number): void {
  disarm(id)
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

/** Empties the queue. */
function clear(): void {
  for (const id of [...countdowns.keys()]) disarm(id)
  toasts.value = []
}

/**
 * Holds every countdown where it stands.
 *
 * clearTimeout alone would lose how much of it was left, and a timeout cannot
 * be asked what it has spent, so the elapsed time comes off the remaining
 * before the handle is dropped. Resuming reschedules the difference, which is
 * why a toast hovered at the last moment still gets its last moment back.
 */
function pauseAll(): void {
  if (paused) return
  paused = true
  const now = Date.now()
  for (const countdown of countdowns.values()) {
    if (countdown.handle === undefined) continue
    clearTimeout(countdown.handle)
    countdown.handle = undefined
    countdown.remaining = Math.max(0, countdown.remaining - (now - countdown.startedAt))
  }
}

/** Starts every held countdown again, each with what it had left. */
function resumeAll(): void {
  if (!paused) return
  paused = false
  for (const [id, countdown] of countdowns) run(id, countdown)
}

export interface UseToastReturn {
  /** The queue, oldest first. Read only: go through show and dismiss. */
  toasts: typeof publicToasts
  show: (options: GlassToastOptions) => number
  dismiss: (id: number) => void
  clear: () => void
  /** Called by the outlet while the pointer or the focus is on the stack. */
  pauseAll: () => void
  resumeAll: () => void
}

const api: UseToastReturn = { toasts: publicToasts, show, dismiss, clear, pauseAll, resumeAll }

/**
 * The toast queue. Callable from anywhere, including outside a component.
 *
 *   const { show } = useToast()
 *   show({ message: 'Saved', variant: 'success' })
 */
export function useToast(): UseToastReturn {
  return api
}

/** Drops the queue, the timers and the ids. For tests, between cases. */
export function resetToasts(): void {
  for (const id of [...countdowns.keys()]) disarm(id)
  toasts.value = []
  nextId = 0
  paused = false
}
