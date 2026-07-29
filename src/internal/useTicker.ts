import {
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export interface UseTickerOptions {
  /** Milliseconds between ticks. Floored at one animation frame. */
  interval: MaybeRefOrGetter<number>
  /** Suspends the ticker without tearing it down. */
  active?: MaybeRefOrGetter<boolean>
}

export interface UseTickerReturn {
  /** Counter that advances once per interval while the ticker runs. */
  tick: Readonly<Ref<number>>
  /** False while the ticker is suspended or motion is reduced. */
  animated: Readonly<Ref<boolean>>
}

/**
 * A counter that advances on an interval and stops for reduced motion.
 *
 * Both text based animations in the library need exactly this, and both had
 * their own copy of it. The preference is watched rather than read once, so
 * turning it on part way through a session stops the animation instead of
 * waiting for a reload.
 *
 * Components read `animated` to pick a resting frame worth showing: an
 * animation frozen at step zero is often the least informative one.
 */
export function useTicker(options: UseTickerOptions): UseTickerReturn {
  const tick = ref(0)
  const reduced = ref(false)
  const animated = ref(false)

  let timer: ReturnType<typeof setInterval> | undefined
  let query: MediaQueryList | undefined

  function onPreferenceChange(event: MediaQueryListEvent) {
    reduced.value = event.matches
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = undefined
    animated.value = false
  }

  function sync() {
    stop()
    if (reduced.value || !(toValue(options.active) ?? true)) return
    animated.value = true
    timer = setInterval(
      () => {
        tick.value++
      },
      Math.max(16, toValue(options.interval)),
    )
  }

  onMounted(() => {
    query = window.matchMedia?.(REDUCED_MOTION)
    reduced.value = query?.matches ?? false
    query?.addEventListener('change', onPreferenceChange)
    sync()
  })

  watch([() => toValue(options.interval), () => toValue(options.active), reduced], sync)

  onBeforeUnmount(() => {
    stop()
    query?.removeEventListener('change', onPreferenceChange)
  })

  return { tick: readonly(tick), animated: readonly(animated) }
}
