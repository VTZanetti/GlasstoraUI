<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ code: string }>()

const state = ref<'idle' | 'copied' | 'failed'>('idle')
let timer: ReturnType<typeof setTimeout> | undefined

const labels = {
  idle: 'copiar',
  copied: 'copiado',
  failed: 'falhou',
}

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    state.value = 'copied'
  } catch {
    state.value = 'failed'
  }
  clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'idle'), 1800)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="code">
    <button class="code__copy" type="button" @click="copy">{{ labels[state] }}</button>
    <pre class="code__body"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code {
  position: relative;
  border: 1px solid rgb(var(--gt-line-tint) / 0.08);
  border-radius: 10px;
  background: rgb(var(--gt-line-tint) / 0.02);
}

.code__copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 10px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--gt-fg-faint);
  /* Sits over scrolling code, so it needs the page colour behind it rather
     than a translucent tint that the text would show through. */
  background: var(--gt-bg);
  border: 1px solid rgb(var(--gt-line-tint) / 0.12);
  border-radius: 6px;
  cursor: pointer;
  transition: color 120ms ease;
}

.code__copy:hover {
  color: var(--gt-fg);
}

.code__body {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.7;
  color: var(--gt-fg-muted);
  white-space: pre;
}
</style>
