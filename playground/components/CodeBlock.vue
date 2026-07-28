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
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 10px;
  background: rgb(255 255 255 / 0.02);
}

.code__copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 10px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #6b6b6b;
  background: rgb(5 5 5 / 0.7);
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 6px;
  cursor: pointer;
  transition: color 120ms ease;
}

.code__copy:hover {
  color: #f5f5f5;
}

.code__body {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.7;
  color: #9e9e9e;
  white-space: pre;
}
</style>
