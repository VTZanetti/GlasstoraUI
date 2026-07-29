<script setup lang="ts">
import { useGlassSurface } from '../composables/useGlassSurface'

// A key cap is far too small to carry a backdrop filter: at this size the blur
// reads as a smudge. It takes the light without the glass instead, so it agrees
// with the panels around it about where the light is coming from.
const { surfaceAttrs } = useGlassSurface({ glass: false })
</script>

<template>
  <kbd class="gt-kbd" v-bind="surfaceAttrs"><slot /></kbd>
</template>

<style>
@layer glasstora {
  .gt-kbd {
    display: inline-block;
    padding: 0.1em 0.5em;
    font-family: var(--gt-font-mono);
    font-size: 0.85em;
    line-height: 1.6;
    color: var(--gt-fg);
    /* The flat fill sits underneath a directional wash, so the face brightens
       on the side the light is on. */
    background-image:
      linear-gradient(
        var(--gt-light-angle),
        transparent 35%,
        rgb(255 255 255 / calc(0.1 * var(--gt-light-energy))) 100%
      ),
      linear-gradient(
        rgb(var(--gt-line-tint) / var(--gt-fill-alpha)),
        rgb(var(--gt-line-tint) / var(--gt-fill-alpha))
      );
    border: 1px solid rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha));
    border-bottom-width: 2px;
    border-radius: var(--gt-radius-sm);
    box-shadow: inset 0 -1px 0 rgb(var(--gt-line-tint) / var(--gt-fill-strong-alpha));
    vertical-align: baseline;
  }
}
</style>
