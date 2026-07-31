<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassCardProps } from '../types'

const props = withDefaults(defineProps<GlassCardProps>(), {
  elevation: 1,
  radius: 'md',
  interactive: false,
  title: '',
  as: 'div',
})

const { surfaceAttrs } = useGlassSurface({
  interactive: () => props.interactive,
  elevation: () => props.elevation,
  radius: () => props.radius,
})
</script>

<template>
  <component :is="as" class="gt-card" v-bind="surfaceAttrs">
    <header v-if="title || $slots.header" class="gt-card__header">
      <slot name="header">
        <h3 class="gt-card__title">{{ title }}</h3>
      </slot>
    </header>
    <div class="gt-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="gt-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<style src="./GlassCard.css"></style>
