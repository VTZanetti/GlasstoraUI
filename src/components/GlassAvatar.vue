<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassAvatarProps } from '../types'

const props = withDefaults(defineProps<GlassAvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  square: false,
})

const { surfaceAttrs } = useGlassSurface({
  radius: () => (props.square ? 'sm' : 'full'),
  grain: false,
})

const broken = ref(false)
watch(
  () => props.src,
  () => (broken.value = false),
)

const showImage = computed(() => Boolean(props.src) && !broken.value)

/** First letter of the first two words, which is the usual monogram. */
const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <span
    class="gt-avatar"
    :class="`gt-avatar--${size}`"
    v-bind="surfaceAttrs"
    :role="showImage ? undefined : 'img'"
    :aria-label="showImage ? undefined : alt || name || undefined"
  >
    <img
      v-if="showImage"
      class="gt-avatar__image"
      :src="src"
      :alt="alt || name"
      @error="broken = true"
    />
    <span v-else class="gt-avatar__initials" aria-hidden="true">{{ initials || '?' }}</span>
  </span>
</template>

<style>
@layer glasstora {
  .gt-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg-muted);
    letter-spacing: 0.04em;
    user-select: none;
  }

  .gt-avatar--sm {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
  .gt-avatar--md {
    width: 34px;
    height: 34px;
    font-size: var(--gt-text-sm);
  }
  .gt-avatar--lg {
    width: 46px;
    height: 46px;
    font-size: var(--gt-text-md);
  }

  .gt-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Monochrome by design, so a colour photograph does not break the palette. */
    filter: grayscale(1) contrast(1.05);
  }
}
</style>
