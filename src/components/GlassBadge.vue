<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassBadgeProps } from '../types'

withDefaults(defineProps<GlassBadgeProps>(), {
  variant: 'neutral',
  dot: true,
  pulse: false,
})

// Same reasoning as GlassKbd: a badge is too small for real glass, but leaving
// it out of the light entirely is exactly what made the two look unrelated.
const { surfaceAttrs } = useGlassSurface({ glass: false })
</script>

<template>
  <span
    class="gt-badge"
    :class="[`gt-badge--${variant}`, { 'gt-badge--pulse': pulse }]"
    v-bind="surfaceAttrs"
  >
    <span v-if="dot" class="gt-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style src="./GlassBadge.css"></style>
