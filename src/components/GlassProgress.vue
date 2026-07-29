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

const { tick, animated } = useTicker({
  interval: SWEEP_TICK_MS,
  active: () => props.indeterminate && props.mode === 'ascii',
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

<style>
@layer glasstora {
  .gt-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
  }

  .gt-progress__track {
    flex: 1;
    display: block;
    height: 4px;
    overflow: hidden;
    border-radius: var(--gt-radius-full);
  }

  .gt-progress--sm .gt-progress__track {
    height: 2px;
  }

  .gt-progress--lg .gt-progress__track {
    height: 6px;
  }

  .gt-progress__fill {
    display: block;
    height: 100%;
    background: var(--gt-gray-9);
    transition: width var(--gt-dur-2) var(--gt-ease);
  }

  .gt-progress--indeterminate .gt-progress__fill {
    width: 30%;
    animation: gt-progress-slide 1.4s var(--gt-ease) infinite;
  }

  @keyframes gt-progress-slide {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(430%);
    }
  }

  .gt-progress__ascii {
    letter-spacing: 0.05em;
    color: var(--gt-fg);
  }

  .gt-progress__value {
    font-size: var(--gt-text-sm);
    color: var(--gt-fg-muted);
    min-width: 4ch;
    text-align: right;
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-progress__fill {
      transition: none;
      animation: none;
    }
  }
}
</style>
