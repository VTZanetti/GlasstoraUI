<script setup lang="ts">
import type { GlassDividerProps } from '../types'

withDefaults(defineProps<GlassDividerProps>(), {
  vertical: false,
  label: '',
})
</script>

<template>
  <div
    class="gt-divider"
    :class="{ 'gt-divider--vertical': vertical, 'gt-divider--labelled': label || $slots.default }"
    role="separator"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
  >
    <span v-if="!vertical && ($slots.default || label)" class="gt-divider__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<style src="./GlassDivider.css"></style>
