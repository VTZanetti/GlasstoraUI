<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useFieldControl } from '../internal/useFieldControl'
import type { GlassTextareaProps } from '../types'

const props = withDefaults(defineProps<GlassTextareaProps>(), {
  modelValue: '',
  rows: 4,
  size: 'md',
  placeholder: '',
  disabled: false,
  readonly: false,
  invalid: false,
  id: '',
  name: '',
  autosize: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { surfaceAttrs } = useGlassSurface()
const control = useFieldControl(props, 'gt-textarea')

const fieldRef = ref<HTMLTextAreaElement | null>(null)

function resize() {
  const el = fieldRef.value
  if (!el || !props.autosize) return
  // Collapse first, otherwise scrollHeight can only ever grow.
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  resize()
}

watch(
  () => props.modelValue,
  () => nextTick(resize),
)
watch(
  () => props.autosize,
  (on) => {
    if (on) nextTick(resize)
    else if (fieldRef.value) fieldRef.value.style.height = ''
  },
)

defineExpose({
  input: fieldRef,
  focus: (options?: FocusOptions) => fieldRef.value?.focus(options),
  blur: () => fieldRef.value?.blur(),
  select: () => fieldRef.value?.select(),
})
</script>

<template>
  <div
    class="gt-textarea"
    :class="[
      `gt-textarea--${size}`,
      { 'gt-textarea--disabled': disabled, 'gt-textarea--invalid': control.invalid.value },
    ]"
    v-bind="surfaceAttrs"
  >
    <textarea
      :id="control.id.value"
      ref="fieldRef"
      class="gt-textarea__field"
      :value="modelValue"
      :rows="rows"
      :name="name || undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="control.required.value"
      :aria-invalid="control.invalid.value || undefined"
      :aria-describedby="control.describedBy.value"
      @input="onInput"
    />
  </div>
</template>

<style src="./GlassTextarea.css"></style>
