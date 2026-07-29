<script setup lang="ts">
import { computed } from 'vue'
import { useTicker } from '../internal/useTicker'
import type { GlassSpinnerProps } from '../types'

const props = withDefaults(defineProps<GlassSpinnerProps>(), {
  size: 'md',
  speed: 80,
  label: '',
})

/** Braille cell patterns, which read as a rotation in a monospace font. */
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const { tick } = useTicker({ interval: () => props.speed })
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

<style>
@layer glasstora {
  .gt-spinner {
    display: inline-block;
    min-width: 1ch;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
    line-height: 1;
  }

  .gt-spinner--sm {
    font-size: var(--gt-text-sm);
  }
  .gt-spinner--md {
    font-size: var(--gt-text-md);
  }
  .gt-spinner--lg {
    font-size: var(--gt-text-lg);
  }
}
</style>
