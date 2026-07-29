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

<style>
@layer glasstora {
  .gt-card {
    display: flex;
    flex-direction: column;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-md);
    color: var(--gt-fg);
    text-align: left;
  }

  .gt-card__header {
    padding: 16px 18px 0;
  }

  .gt-card__title {
    margin: 0;
    font-size: var(--gt-text-md);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }

  .gt-card__body {
    flex: 1 1 auto;
    padding: 16px 18px;
    color: var(--gt-fg-muted);
    line-height: 1.7;
  }

  .gt-card__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 18px 16px;
  }

  /* A card rendered as a button carries the browser defaults with it. */
  button.gt-card {
    width: 100%;
    cursor: pointer;
    font: inherit;
  }
}
</style>
