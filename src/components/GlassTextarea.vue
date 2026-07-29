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

<style>
@layer glasstora {
  .gt-textarea {
    display: flex;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
    border-radius: var(--gt-radius-sm);
    cursor: text;
  }

  .gt-textarea--sm {
    padding: 8px 10px;
    font-size: var(--gt-text-sm);
  }
  .gt-textarea--md {
    padding: 10px 12px;
    font-size: var(--gt-text-md);
  }
  .gt-textarea--lg {
    padding: 12px 14px;
    font-size: var(--gt-text-lg);
  }

  .gt-textarea__field {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    line-height: 1.7;
    resize: vertical;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha)) transparent;
  }

  .gt-textarea__field::placeholder {
    color: var(--gt-fg-faint);
  }

  .gt-textarea:focus-within {
    outline: 1px solid rgb(var(--gt-line-tint) / var(--gt-focus-alpha));
    outline-offset: 2px;
  }

  .gt-textarea--invalid {
    --gt-border-alpha: 0.4;
    border-style: dashed;
  }

  .gt-textarea--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
</style>
