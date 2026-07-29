<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassSurfaceProps } from '../types'

const props = withDefaults(defineProps<GlassSurfaceProps>(), {
  elevation: 1,
  interactive: false,
  radius: 'md',
  as: 'div',
})

const { surfaceAttrs } = useGlassSurface({
  interactive: () => props.interactive,
  elevation: () => props.elevation,
  radius: () => props.radius,
})
</script>

<template>
  <component :is="as" class="gt-surface" v-bind="surfaceAttrs">
    <slot />
  </component>
</template>

<style>
@layer glasstora {
  .gt-surface {
    padding: 20px;
  }
}
</style>
