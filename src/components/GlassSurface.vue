<script setup lang="ts">
import type { GlassSurfaceProps } from '../types'

withDefaults(defineProps<GlassSurfaceProps>(), {
  elevation: 1,
  interactive: false,
  radius: 'md',
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    class="gt-surface gt-glass"
    :class="[`gt-elev-${elevation}`, `gt-r-${radius}`, { 'gt-glass--interactive': interactive }]"
  >
    <slot />
  </component>
</template>

<style>
.gt-surface {
  padding: 20px;
}
</style>
