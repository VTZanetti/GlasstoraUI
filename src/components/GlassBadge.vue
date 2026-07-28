<script setup lang="ts">
import type { GlassBadgeProps } from '../types'

withDefaults(defineProps<GlassBadgeProps>(), {
  variant: 'neutral',
  dot: true,
  pulse: false,
})
</script>

<template>
  <span class="gt-badge" :class="[`gt-badge--${variant}`, { 'gt-badge--pulse': pulse }]">
    <span v-if="dot" class="gt-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style>
.gt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  font-family: var(--gt-font-mono);
  font-size: var(--gt-text-sm);
  letter-spacing: 0.06em;
  border-radius: var(--gt-radius-full);
  white-space: nowrap;
}

.gt-badge--neutral {
  color: var(--gt-fg);
  background: rgb(255 255 255 / 0.07);
  border: 1px solid rgb(255 255 255 / 0.14);
}

.gt-badge--outline {
  color: var(--gt-fg-muted);
  background: transparent;
  border: 1px solid rgb(255 255 255 / 0.3);
}

.gt-badge--solid {
  color: var(--gt-gray-0);
  background: var(--gt-gray-9);
  border: 1px solid var(--gt-gray-9);
}

.gt-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--gt-radius-full);
  background: currentColor;
}

.gt-badge--pulse .gt-badge__dot {
  animation: gt-badge-pulse 1.6s var(--gt-ease) infinite;
}

@keyframes gt-badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gt-badge--pulse .gt-badge__dot {
    animation: none;
  }
}
</style>
