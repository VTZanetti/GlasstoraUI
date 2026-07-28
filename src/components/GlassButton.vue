<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { GlassButtonProps } from '../types'

const props = withDefaults(defineProps<GlassButtonProps>(), {
  variant: 'solid',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{ click: [ev: MouseEvent] }>()

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const frame = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

watch(
  () => props.loading,
  (loading) => {
    if (loading && !timer) {
      timer = setInterval(() => {
        frame.value = (frame.value + 1) % FRAMES.length
      }, 80)
    } else if (!loading && timer) {
      clearInterval(timer)
      timer = undefined
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function onClick(ev: MouseEvent) {
  if (props.loading || props.disabled) return
  emit('click', ev)
}
</script>

<template>
  <button
    class="gt-button gt-glass gt-glass--interactive"
    :class="[`gt-button--${variant}`, `gt-button--${size}`]"
    :type="type"
    :disabled="disabled"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="gt-button__spinner" aria-hidden="true">{{ FRAMES[frame] }}</span>
    <span class="gt-button__label"><slot /></span>
  </button>
</template>

<style>
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
</style>
