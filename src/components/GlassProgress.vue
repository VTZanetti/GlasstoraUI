<script setup lang="ts">
import { computed } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useTicker } from '../internal/useTicker'
import type { GlassProgressProps } from '../types'

const props = withDefaults(defineProps<GlassProgressProps>(), {
  value: 0,
  max: 100,
  mode: 'line',
  cols: 20,
  showValue: false,
  indeterminate: false,
  size: 'md',
})

// The track is only a few pixels tall, so grain and ring would just add noise.
const { surfaceAttrs } = useGlassSurface({ ring: false, grain: false })

const ratio = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(1, Math.max(0, props.value / props.max))
})

const pct = computed(() => Math.round(ratio.value * 100))

/**
 * Shade blocks, from empty to solid. Two characters give a cell two states, so
 * an indeterminate bar built from them can only blink. The partial shades give
 * each cell four, which is enough for a band to read as travelling rather than
 * switching on and off.
 */
const SHADES = ['░', '▒', '▓', '█']

/** Matches the 1.4s of the line mode animation, so the two modes agree. */
const SWEEP_MS = 1400
const SWEEP_TICK_MS = 50

const columns = computed(() => Math.max(1, Math.round(props.cols)))

/** Every mode that draws itself cell by cell shares one sweep. */
const CELL_MODES = ['ascii', 'blocks', 'dots'] as const

const { tick, animated } = useTicker({
  interval: SWEEP_TICK_MS,
  active: () =>
    props.indeterminate && CELL_MODES.includes(props.mode as (typeof CELL_MODES)[number]),
})

function determinateBar(cols: number): string {
  const filled = Math.min(cols, Math.max(0, Math.round(ratio.value * cols)))
  return SHADES[3].repeat(filled) + SHADES[0].repeat(cols - filled)
}

function sweepBar(cols: number): string {
  // A band roughly a fifth of the track wide, travelling around it. The
  // distance wraps at the ends, so the band leaves one edge and enters the
  // other in the same instant. Letting it slide off and come back would leave
  // the track empty between passes, which is the stall that makes an
  // indeterminate bar look like it is switching on and off.
  const half = Math.min(6, Math.max(2.5, cols / 5))
  // Held at the midpoint when motion is reduced. Frozen at the start the band
  // would sit on the first cell, and a bar lit only at the left edge reads as
  // zero percent rather than as unknown.
  const phase = animated.value ? ((tick.value * SWEEP_TICK_MS) % SWEEP_MS) / SWEEP_MS : 0.5
  const head = phase * cols

  let bar = ''
  for (let i = 0; i < cols; i++) {
    const offset = Math.abs(i - head)
    const distance = Math.min(offset, cols - offset)
    const level = Math.max(0, 1 - distance / half)
    bar += SHADES[Math.min(SHADES.length - 1, Math.floor(level * SHADES.length))]
  }
  return bar
}

const asciiBar = computed(() =>
  props.indeterminate ? sweepBar(columns.value) : determinateBar(columns.value),
)

/**
 * Segment brightness from 0 to 3, the same scale the shade characters use, so
 * the drawn modes and the written one describe the same bar.
 */
const segments = computed<number[]>(() => {
  const cols = columns.value
  if (!props.indeterminate) {
    const filled = Math.min(cols, Math.max(0, Math.round(ratio.value * cols)))
    return Array.from({ length: cols }, (_, i) => (i < filled ? 3 : 0))
  }
  const half = Math.min(6, Math.max(2.5, cols / 5))
  const phase = animated.value ? ((tick.value * SWEEP_TICK_MS) % SWEEP_MS) / SWEEP_MS : 0.5
  const head = phase * cols
  return Array.from({ length: cols }, (_, i) => {
    const offset = Math.abs(i - head)
    const distance = Math.min(offset, cols - offset)
    const level = Math.max(0, 1 - distance / half)
    return Math.min(3, Math.floor(level * 4))
  })
})
</script>

<template>
  <div
    class="gt-progress"
    :class="[
      `gt-progress--${size}`,
      `gt-progress--${mode}`,
      { 'gt-progress--indeterminate': indeterminate },
    ]"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    <!-- The percentage is hidden while indeterminate, for the same reason
         aria-valuenow is omitted: there is no percentage to report, and the one
         derived from value would be a number nobody asked for. -->
    <template v-if="mode === 'ascii'">
      <span class="gt-progress__ascii" aria-hidden="true">{{ asciiBar }}</span>
      <span v-if="showValue && !indeterminate" class="gt-progress__value" aria-hidden="true"
        >{{ pct }}%</span
      >
    </template>
    <template v-else-if="mode === 'blocks' || mode === 'dots'">
      <span class="gt-progress__cells" aria-hidden="true">
        <span
          v-for="(level, index) in segments"
          :key="index"
          class="gt-progress__cell"
          :class="`gt-progress__cell--${level}`"
        />
      </span>
      <span v-if="showValue && !indeterminate" class="gt-progress__value" aria-hidden="true"
        >{{ pct }}%</span
      >
    </template>
    <template v-else>
      <span class="gt-progress__track" v-bind="surfaceAttrs">
        <span class="gt-progress__fill" :style="indeterminate ? undefined : { width: `${pct}%` }" />
      </span>
      <span v-if="showValue && !indeterminate" class="gt-progress__value" aria-hidden="true"
        >{{ pct }}%</span
      >
    </template>
  </div>
</template>

<style src="./GlassProgress.css"></style>
