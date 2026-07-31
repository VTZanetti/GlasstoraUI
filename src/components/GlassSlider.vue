<script setup lang="ts">
import { computed, ref } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useFieldControl } from '../internal/useFieldControl'
import type { GlassSliderProps } from '../types'

const props = withDefaults(defineProps<GlassSliderProps>(), {
  modelValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  size: 'md',
  showValue: false,
  formatValue: undefined,
  id: '',
  name: '',
  invalid: false,
  required: false,
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const trackRef = ref<HTMLElement | null>(null)
const { surfaceAttrs } = useGlassSurface({ radius: 'full', grain: false })
const control = useFieldControl(props, 'gt-slider')

const { value, setValue } = useControllable(
  () => props.modelValue,
  (next) => emit('update:modelValue', next),
  () => props.min,
)

/**
 * Steps accumulate floating point error: ten additions of 0.1 land on
 * 0.9999999999999999 rather than 1. Rounding to the decimals the step itself
 * has keeps the value printable and comparable.
 */
const decimals = computed(() => {
  const text = String(props.step)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
})

function quantise(raw: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, raw))
  const stepped = props.min + Math.round((clamped - props.min) / props.step) * props.step
  return Number(Math.min(props.max, Math.max(props.min, stepped)).toFixed(decimals.value))
}

const current = computed(() => quantise(value.value))

const percent = computed(() => {
  const span = props.max - props.min
  return span === 0 ? 0 : ((current.value - props.min) / span) * 100
})

const display = computed(() =>
  props.formatValue ? props.formatValue(current.value) : String(current.value),
)

function commit(next: number) {
  const quantised = quantise(next)
  if (quantised === current.value) return
  setValue(quantised)
}

function nudge(steps: number) {
  if (props.disabled) return
  const before = current.value
  commit(current.value + steps * props.step)
  if (current.value !== before) emit('change', current.value)
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const page = props.step * 10

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      nudge(1)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      nudge(-1)
      break
    case 'PageUp':
      nudge(page / props.step)
      break
    case 'PageDown':
      nudge(-page / props.step)
      break
    case 'Home':
      commit(props.min)
      emit('change', current.value)
      break
    case 'End':
      commit(props.max)
      emit('change', current.value)
      break
    default:
      return
  }
  event.preventDefault()
}

function valueAt(clientX: number): number {
  const track = trackRef.value
  if (!track) return current.value
  const rect = track.getBoundingClientRect()
  if (rect.width === 0) return current.value
  const ratio = (clientX - rect.left) / rect.width
  return props.min + ratio * (props.max - props.min)
}

function onPointerDown(event: PointerEvent) {
  // Checked before capturing, or a disabled slider would still swallow the
  // pointer for the rest of the gesture.
  if (props.disabled) return
  const track = trackRef.value
  if (!track) return
  track.setPointerCapture(event.pointerId)
  commit(valueAt(event.clientX))
  event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
  const track = trackRef.value
  if (!track?.hasPointerCapture(event.pointerId)) return
  commit(valueAt(event.clientX))
}

function onPointerUp(event: PointerEvent) {
  const track = trackRef.value
  if (!track?.hasPointerCapture(event.pointerId)) return
  track.releasePointerCapture(event.pointerId)
  emit('change', current.value)
}
</script>

<template>
  <div
    class="gt-slider"
    :class="[`gt-slider--${size}`, { 'gt-slider--disabled': disabled }]"
    :style="{ '--gt-slider-pct': `${percent}%` }"
  >
    <div
      ref="trackRef"
      class="gt-slider__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span class="gt-slider__fill" aria-hidden="true" />
      <span
        :id="control.id.value"
        class="gt-slider__thumb"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="current"
        :aria-valuetext="formatValue ? display : undefined"
        :aria-orientation="'horizontal'"
        :aria-label="label || undefined"
        :aria-describedby="control.describedBy.value"
        :aria-invalid="control.invalid.value || undefined"
        :aria-required="control.required.value || undefined"
        :aria-disabled="disabled || undefined"
        v-bind="surfaceAttrs"
        @keydown="onKeydown"
      />
    </div>
    <span v-if="showValue" class="gt-slider__value">{{ display }}</span>
    <input v-if="name" type="hidden" :name="name" :value="current" />
  </div>
</template>

<style src="./GlassSlider.css"></style>
