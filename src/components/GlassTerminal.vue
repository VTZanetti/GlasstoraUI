<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { prefersReducedMotion } from '../composables/capabilities'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassTerminalProps } from '../types'

const props = withDefaults(defineProps<GlassTerminalProps>(), {
  title: 'glasstora',
  lines: () => [],
  typewriter: false,
  speed: 24,
  prompt: '>',
  scanlines: false,
})

const emit = defineEmits<{ done: [] }>()

const { surfaceAttrs } = useGlassSurface({ elevation: 2, radius: 'lg' })

const shown = ref<string[]>(props.typewriter ? [] : [...props.lines])
const writing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
  writing.value = false
}

function run() {
  stop()
  if (!props.typewriter) {
    shown.value = [...props.lines]
    return
  }
  if (props.lines.length === 0 || prefersReducedMotion()) {
    shown.value = [...props.lines]
    emit('done')
    return
  }

  writing.value = true
  shown.value = ['']
  let lineIdx = 0
  let charIdx = 0
  timer = setInterval(() => {
    const line = props.lines[lineIdx]
    if (charIdx < line.length) {
      charIdx++
      shown.value[lineIdx] = line.slice(0, charIdx)
    } else {
      lineIdx++
      charIdx = 0
      if (lineIdx >= props.lines.length) {
        stop()
        emit('done')
        return
      }
      shown.value.push('')
    }
  }, props.speed)
}

onMounted(run)

// New lines used to be ignored until the component was remounted, which the
// demo worked around by bumping a :key. Restarting on a change is what the
// prop looked like it did all along.
watch([() => props.lines, () => props.typewriter, () => props.speed], () => run(), { deep: true })

onBeforeUnmount(stop)

defineExpose({ replay: run })
</script>

<template>
  <div class="gt-terminal" v-bind="surfaceAttrs">
    <div class="gt-terminal__bar">
      <span class="gt-terminal__dots" aria-hidden="true"><i /><i /><i /></span>
      <span class="gt-terminal__title">{{ title }}</span>
      <span aria-hidden="true" />
    </div>
    <div class="gt-terminal__screen">
      <template v-if="lines.length">
        <div class="gt-visually-hidden">{{ lines.join('. ') }}</div>
        <div class="gt-terminal__lines" aria-hidden="true">
          <div v-for="(line, i) in shown" :key="i" class="gt-terminal__line">
            <span class="gt-terminal__prompt">{{ prompt }}</span>
            <span class="gt-terminal__text">{{ line }}</span>
            <span v-if="writing && i === shown.length - 1" class="gt-terminal__cursor">█</span>
          </div>
        </div>
      </template>
      <slot v-else />
      <div v-if="scanlines" class="gt-terminal__scanlines gt-scanlines" aria-hidden="true" />
    </div>
  </div>
</template>

<style>
@layer glasstora {
  .gt-terminal {
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
    border-radius: var(--gt-radius-lg);
    overflow: hidden;
  }

  .gt-terminal__bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid rgb(var(--gt-line-tint) / var(--gt-line-alpha));
  }

  .gt-terminal__dots {
    display: inline-flex;
    gap: 6px;
    justify-self: start;
  }

  .gt-terminal__dots i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .gt-terminal__dots i:nth-child(1) {
    background: var(--gt-gray-4);
  }

  .gt-terminal__dots i:nth-child(2) {
    background: var(--gt-gray-6);
  }

  .gt-terminal__dots i:nth-child(3) {
    background: var(--gt-gray-8);
  }

  .gt-terminal__title {
    font-size: var(--gt-text-sm);
    color: var(--gt-fg-muted);
    letter-spacing: 0.04em;
  }

  .gt-terminal__screen {
    position: relative;
    min-height: 120px;
    padding: 16px;
    font-size: var(--gt-text-sm);
    line-height: 1.8;
  }

  .gt-terminal__line {
    display: flex;
    gap: 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .gt-terminal__prompt {
    color: var(--gt-fg-faint);
    user-select: none;
  }

  .gt-terminal__text {
    color: var(--gt-fg-muted);
  }

  .gt-terminal__cursor {
    color: var(--gt-fg);
    animation: gt-blink var(--gt-caret-blink) steps(1) infinite;
  }

  .gt-terminal__scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
  }
}
</style>
