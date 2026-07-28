<script setup lang="ts">
import CodeBlock from './CodeBlock.vue'

defineProps<{ id: string; name: string; description: string; code: string }>()
</script>

<template>
  <article :id="id" class="showcase">
    <header class="showcase__header">
      <h3 class="showcase__name">{{ name }}</h3>
      <p class="showcase__description">{{ description }}</p>
    </header>

    <div v-if="$slots.controls" class="showcase__controls">
      <slot name="controls" />
    </div>

    <div class="showcase__preview">
      <slot />
    </div>

    <CodeBlock :code="code" />
  </article>
</template>

<style scoped>
.showcase {
  scroll-margin-top: 32px;
}

.showcase + .showcase {
  margin-top: 72px;
}

.showcase__header {
  margin-bottom: 18px;
}

.showcase__name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f5f5f5;
}

.showcase__description {
  margin: 0;
  max-width: 62ch;
  font-size: 13px;
  line-height: 1.7;
  color: #9e9e9e;
}

.showcase__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px dashed rgb(255 255 255 / 0.1);
  border-radius: 10px;
}

/* The preview area stays transparent so the glass reads against the page
   texture instead of another opaque panel. */
.showcase__preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  min-height: 96px;
  padding: 28px;
  margin-bottom: 12px;
  border: 1px solid rgb(255 255 255 / 0.06);
  border-radius: 10px;
}
</style>
