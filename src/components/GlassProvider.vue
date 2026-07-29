<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, reactive, readonly, ref, watch } from 'vue'
import { configKey, lightKey, type GlassConfig, type GlassLightMode } from '../internal/keys'
import {
  clearLightSource,
  configureLight,
  setLightDriver,
  setLightSource,
} from '../internal/lightRegistry'
import {
  acquireRefractionFilter,
  releaseRefractionFilter,
  setRefractionStrength,
} from '../internal/refractDefs'
import {
  detectRefraction,
  hasCoarsePointer,
  isIOS,
  prefersReducedMotion,
} from '../composables/capabilities'
import type { GlassProviderProps } from '../types'

const props = withDefaults(defineProps<GlassProviderProps>(), {
  refraction: 'auto',
  refractionStrength: 24,
  trackPointer: true,
  grain: true,
  theme: 'dark',
  lightFalloff: 900,
  lightHeight: 520,
  lightGain: 1,
})

const x = ref(0)
const y = ref(0)
const mode = ref<GlassLightMode>('static')

let suspended = false
let driftStart = 0
const ownedGates = new Set<string>()
const cleanups: (() => void)[] = []

/**
 * Publishes a position. The registry owns the animation frame from here on, so
 * the provider never runs a loop of its own and the page has exactly one.
 */
function emitLight(px: number, py: number) {
  x.value = px
  y.value = py
  setLightSource(px, py)
}

function onPointerMove(e: PointerEvent) {
  if (suspended) return
  emitLight(e.clientX, e.clientY)
}

/**
 * Lissajous curve with incommensurable frequencies, so the slow wander never
 * repeats. A full cycle takes roughly 48 seconds. Handed to the registry as a
 * per frame source rather than driven from here, so touch devices do not end up
 * with a second animation loop.
 */
function drift(now: number) {
  if (suspended) return null
  if (!driftStart) driftStart = now
  const t = now - driftStart
  const px = window.innerWidth * (0.5 + 0.32 * Math.sin(t * 0.00013))
  const py = window.innerHeight * (0.35 + 0.22 * Math.cos(t * 0.00009))
  x.value = px
  y.value = py
  return { x: px, y: py }
}

function stopEngine() {
  setLightDriver(null)
  window.removeEventListener('pointermove', onPointerMove)
}

function startEngine() {
  stopEngine()
  if (prefersReducedMotion() || !props.trackPointer) {
    mode.value = 'static'
    // Falls back to the --gt-light-x and --gt-light-y defaults from tokens.css,
    // and every registered surface gets one static pass at that position.
    clearLightSource()
    return
  }
  if (hasCoarsePointer()) {
    mode.value = 'drift'
    driftStart = 0
    setLightDriver(drift)
    return
  }
  mode.value = 'pointer'
  window.addEventListener('pointermove', onPointerMove, { passive: true })
}

function set(px: number, py: number) {
  suspended = true
  emitLight(px, py)
}

function resume() {
  suspended = false
}

function setGate(name: string, value = '') {
  document.documentElement.setAttribute(name, value)
  ownedGates.add(name)
}

function clearGate(name: string) {
  document.documentElement.removeAttribute(name)
  ownedGates.delete(name)
}

// Reapplied whenever the related props change, so consumers can toggle the
// effects at runtime instead of only at mount.
function applyGates() {
  const refractOn = props.refraction === 'on' || (props.refraction === 'auto' && detectRefraction())
  if (refractOn) setGate('data-gt-refract')
  else clearGate('data-gt-refract')

  if (props.grain) clearGate('data-gt-grain')
  else setGate('data-gt-grain', 'off')

  // Cleared as well as set, because the fallback has to come back off if the
  // browser stops looking like iOS between two calls.
  if (isIOS()) setGate('data-gt-sheen', 'static')
  else clearGate('data-gt-sheen')
}

function applyTheme() {
  if (props.theme === 'auto') {
    const light = window.matchMedia?.('(prefers-color-scheme: light)').matches
    setGate('data-gt-theme', light ? 'light' : 'dark')
    return
  }
  setGate('data-gt-theme', props.theme)
}

function applyTuning() {
  configureLight({
    falloff: props.lightFalloff,
    height: props.lightHeight,
    gain: props.lightGain,
  })
}

onMounted(() => {
  applyGates()
  applyTheme()
  applyTuning()
  acquireRefractionFilter(props.refractionStrength)

  for (const query of ['(prefers-reduced-motion: reduce)', '(pointer: coarse)']) {
    const mq = window.matchMedia(query)
    const handler = () => startEngine()
    mq.addEventListener('change', handler)
    cleanups.push(() => mq.removeEventListener('change', handler))
  }

  const scheme = window.matchMedia('(prefers-color-scheme: light)')
  const onScheme = () => applyTheme()
  scheme.addEventListener('change', onScheme)
  cleanups.push(() => scheme.removeEventListener('change', onScheme))

  startEngine()
})

watch([() => props.refraction, () => props.grain], applyGates)
watch(() => props.theme, applyTheme)
watch(() => props.trackPointer, startEngine)
watch(
  () => props.refractionStrength,
  (value) => setRefractionStrength(value),
)
watch([() => props.lightFalloff, () => props.lightHeight, () => props.lightGain], applyTuning)

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  stopEngine()
  clearLightSource()
  releaseRefractionFilter()
  cleanups.forEach((fn) => fn())
  const el = document.documentElement
  ownedGates.forEach((name) => el.removeAttribute(name))
  ownedGates.clear()
})

// Reactive by construction: the getters are read through the proxy, so a
// consumer that injects the config re-renders when the prop behind it moves.
// The 0.1.0 version handed out a plain snapshot that never updated.
const config: GlassConfig = reactive({
  get grain() {
    return props.grain
  },
  get refraction() {
    return props.refraction
  },
  get theme() {
    return props.theme
  },
})

provide(lightKey, { x: readonly(x), y: readonly(y), mode: readonly(mode), set, resume })
provide(configKey, config)
</script>

<template>
  <div class="gt-provider">
    <slot />
  </div>
</template>

<style>
@layer glasstora {
  /* The refraction filter is appended to the body by refractDefs.ts. Never use
     display:none here: Chromium ignores filter references that live inside a
     hidden subtree. */
  .gt-defs {
    position: fixed;
    width: 0;
    height: 0;
    pointer-events: none;
  }
}
</style>
