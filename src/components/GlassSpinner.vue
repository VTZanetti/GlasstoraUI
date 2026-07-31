<script setup lang="ts">
import { computed } from 'vue'
import { useTicker } from '../internal/useTicker'
import type { GlassSpinnerProps } from '../types'

const props = withDefaults(defineProps<GlassSpinnerProps>(), {
  size: 'md',
  speed: 12,
  label: '',
})

/** Braille cell patterns, which read as a rotation in a monospace font. */
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// Frames per second rather than the delay between them, so turning the number
// up speeds the spinner up, which is what the name promises. The ticker floors
// the result at one animation frame, so an absurd rate costs nothing extra.
const { tick } = useTicker({ interval: () => 1000 / Math.max(1, props.speed) })
const glyph = computed(() => FRAMES[tick.value % FRAMES.length])

defineExpose({ frames: FRAMES })
</script>

<template>
  <span
    class="gt-spinner"
    :class="`gt-spinner--${size}`"
    :role="props.label ? 'status' : undefined"
    :aria-label="props.label || undefined"
    :aria-hidden="props.label ? undefined : 'true'"
    >{{ glyph }}</span
  >
</template>

<style src="./GlassSpinner.css"></style>
