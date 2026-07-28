<script lang="ts">
// Module scoped so nested providers still render a single filter definition.
let providerCount = 0
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, readonly, ref, watch } from 'vue'
import { configKey, lightKey, type GlassLightMode } from '../internal/keys'
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
})

const first = typeof window === 'undefined' || providerCount === 0
providerCount++

const x = ref(0)
const y = ref(0)
const mode = ref<GlassLightMode>('static')

let rafId = 0
let framePending = false
let lastX = 0
let lastY = 0
let suspended = false
let driftStart = 0
const ownedGates = new Set<string>()
const cleanups: (() => void)[] = []

function writeLight(px: number, py: number) {
  x.value = px
  y.value = py
  document.documentElement.style.setProperty('--gt-light-x', `${px}px`)
  document.documentElement.style.setProperty('--gt-light-y', `${py}px`)
}

function onPointerMove(e: PointerEvent) {
  lastX = e.clientX
  lastY = e.clientY
  if (!framePending && !suspended) {
    framePending = true
    rafId = requestAnimationFrame(() => {
      framePending = false
      writeLight(lastX, lastY)
    })
  }
}

// Animation frames stop firing on hidden tabs, so the drift pauses on its own.
function driftLoop(now: number) {
  if (!suspended) {
    const t = now - driftStart
    const w = window.innerWidth
    const h = window.innerHeight
    // Lissajous curve with incommensurable frequencies, so the slow wander
    // never repeats. A full cycle takes roughly 48 seconds.
    writeLight(w * (0.5 + 0.32 * Math.sin(t * 0.00013)), h * (0.35 + 0.22 * Math.cos(t * 0.00009)))
  }
  rafId = requestAnimationFrame(driftLoop)
}

function stopEngine() {
  cancelAnimationFrame(rafId)
  framePending = false
  window.removeEventListener('pointermove', onPointerMove)
}

function startEngine() {
  stopEngine()
  if (prefersReducedMotion() || !props.trackPointer) {
    mode.value = 'static'
    document.documentElement.style.removeProperty('--gt-light-x')
    document.documentElement.style.removeProperty('--gt-light-y')
    return
  }
  if (hasCoarsePointer()) {
    mode.value = 'drift'
    driftStart = performance.now()
    rafId = requestAnimationFrame(driftLoop)
    return
  }
  mode.value = 'pointer'
  window.addEventListener('pointermove', onPointerMove, { passive: true })
}

function set(px: number, py: number) {
  suspended = true
  writeLight(px, py)
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

  if (isIOS()) setGate('data-gt-sheen', 'static')
}

onMounted(() => {
  applyGates()

  for (const query of ['(prefers-reduced-motion: reduce)', '(pointer: coarse)']) {
    const mq = window.matchMedia(query)
    const handler = () => startEngine()
    mq.addEventListener('change', handler)
    cleanups.push(() => mq.removeEventListener('change', handler))
  }

  startEngine()
})

watch([() => props.refraction, () => props.grain], applyGates)
watch(() => props.trackPointer, startEngine)

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  stopEngine()
  cleanups.forEach((fn) => fn())
  const el = document.documentElement
  ownedGates.forEach((name) => el.removeAttribute(name))
  ownedGates.clear()
  el.style.removeProperty('--gt-light-x')
  el.style.removeProperty('--gt-light-y')
  providerCount--
})

provide(lightKey, { x: readonly(x), y: readonly(y), mode: readonly(mode), set, resume })
provide(configKey, { grain: props.grain, refraction: props.refraction })
</script>

<template>
  <div class="gt-provider">
    <svg v-if="first" class="gt-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="gt-refraction"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.011"
            numOctaves="2"
            seed="7"
            stitchTiles="stitch"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            :scale="refractionStrength"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
    <slot />
  </div>
</template>

<style>
/* Never use display:none here. Chromium ignores filter references that live
   inside a hidden subtree. */
.gt-defs {
  position: fixed;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
