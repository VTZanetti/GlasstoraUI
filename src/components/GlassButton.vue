<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import GlassSpinner from './GlassSpinner.vue'
import type { GlassButtonProps } from '../types'

const props = withDefaults(defineProps<GlassButtonProps>(), {
  variant: 'solid',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{ click: [ev: MouseEvent] }>()

const { surfaceAttrs } = useGlassSurface({ interactive: true })

// The braille frames used to be looped here, on a setInterval that ignored
// prefers-reduced-motion entirely. GlassSpinner owns both now, so there is one
// place where that preference is honoured.
function onClick(ev: MouseEvent) {
  if (props.loading || props.disabled) return
  emit('click', ev)
}
</script>

<template>
  <button
    class="gt-button"
    :class="[`gt-button--${variant}`, `gt-button--${size}`]"
    v-bind="surfaceAttrs"
    :type="type"
    :disabled="disabled"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <GlassSpinner v-if="loading" class="gt-button__spinner" :size="size" />
    <span class="gt-button__label"><slot /></span>
  </button>
</template>

<style>
@layer glasstora {
  .gt-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
    letter-spacing: 0.02em;
    cursor: pointer;
    user-select: none;
    border-radius: var(--gt-radius-sm);
  }

  .gt-button--sm {
    height: 28px;
    padding: 0 12px;
    font-size: var(--gt-text-sm);
  }

  .gt-button--md {
    height: 36px;
    padding: 0 16px;
    font-size: var(--gt-text-md);
  }

  .gt-button--lg {
    height: 44px;
    padding: 0 22px;
    font-size: var(--gt-text-lg);
  }

  .gt-button--solid {
    --gt-glass-alpha: 0.1;
    --gt-glass-alpha-hover: 0.16;
    --gt-border-alpha: 0.24;
  }

  .gt-button--ghost {
    --gt-glass-alpha: 0.02;
    --gt-glass-alpha-hover: 0.08;
    --gt-border-alpha: 0.1;
    color: var(--gt-fg-muted);
  }

  .gt-button--ghost:hover {
    color: var(--gt-fg);
  }

  .gt-button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .gt-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .gt-button__spinner {
    display: inline-block;
    min-width: 1ch;
  }
}
</style>
