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

<style src="./GlassButton.css"></style>
