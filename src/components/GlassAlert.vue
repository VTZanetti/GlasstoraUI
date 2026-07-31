<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassAlertProps } from '../types'

const props = withDefaults(defineProps<GlassAlertProps>(), {
  variant: 'info',
  title: '',
  closable: false,
  closeLabel: 'Dismiss',
})

const emit = defineEmits<{ close: [] }>()

const { surfaceAttrs } = useGlassSurface({ radius: 'sm' })

/** The palette carries no colour, so the variant reads as a glyph and a rule. */
const MARKS = { info: 'i', warn: '!', error: '×', success: '✓' } as const
</script>

<template>
  <div
    class="gt-alert"
    :class="`gt-alert--${variant}`"
    v-bind="surfaceAttrs"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <span class="gt-alert__mark" aria-hidden="true">{{ MARKS[variant] }}</span>
    <div class="gt-alert__content">
      <p v-if="title" class="gt-alert__title">{{ title }}</p>
      <div v-if="$slots.default" class="gt-alert__body"><slot /></div>
    </div>
    <button
      v-if="props.closable"
      class="gt-alert__close"
      type="button"
      :aria-label="closeLabel"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<style src="./GlassAlert.css"></style>
