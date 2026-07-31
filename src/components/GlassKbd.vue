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

<style src="./GlassKbd.css"></style>
