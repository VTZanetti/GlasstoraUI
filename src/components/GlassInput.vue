<script setup lang="ts">
import { ref } from 'vue'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useFieldControl } from '../internal/useFieldControl'
import type { GlassInputProps } from '../types'

const props = withDefaults(defineProps<GlassInputProps>(), {
  modelValue: '',
  size: 'md',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  invalid: false,
  id: '',
  name: '',
  autocomplete: '',
  required: false,
  prompt: false,
  blockCaret: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { surfaceAttrs } = useGlassSurface()
const control = useFieldControl(props, 'gt-input')

const fieldRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const caretCol = ref(0)

function syncCaret() {
  caretCol.value = fieldRef.value?.selectionStart ?? 0
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  syncCaret()
}

function onFocus() {
  focused.value = true
  syncCaret()
}

function onBlur() {
  focused.value = false
}

// Nothing in 0.1.0 could be driven imperatively, so focusing a field after a
// failed submit meant reaching into the DOM by hand.
defineExpose({
  input: fieldRef,
  focus: (options?: FocusOptions) => fieldRef.value?.focus(options),
  blur: () => fieldRef.value?.blur(),
  select: () => fieldRef.value?.select(),
})
</script>

<template>
  <label
    class="gt-input"
    :class="[
      `gt-input--${size}`,
      {
        'gt-input--disabled': disabled,
        'gt-input--invalid': control.invalid.value,
        'gt-input--block-caret': blockCaret,
      },
    ]"
    v-bind="surfaceAttrs"
  >
    <span v-if="props.prompt" class="gt-input__prompt" aria-hidden="true">&gt;</span>
    <slot name="prefix" />
    <span class="gt-input__box">
      <input
        :id="control.id.value"
        ref="fieldRef"
        class="gt-input__field"
        :value="modelValue"
        :type="type"
        :name="name || undefined"
        :autocomplete="autocomplete || undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="control.required.value"
        :aria-invalid="control.invalid.value || undefined"
        :aria-describedby="control.describedBy.value"
        @input="onInput"
        @keyup="syncCaret"
        @click="syncCaret"
        @select="syncCaret"
        @focus="onFocus"
        @blur="onBlur"
      />
      <span
        v-if="blockCaret && focused"
        class="gt-input__caret"
        aria-hidden="true"
        :style="{ left: `${caretCol}ch` }"
        >█</span
      >
    </span>
    <slot name="suffix" />
  </label>
</template>

<style>
@layer glasstora {
  .gt-input {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--gt-font-mono);
    color: var(--gt-fg);
    border-radius: var(--gt-radius-sm);
    cursor: text;
  }

  .gt-input--sm {
    height: 28px;
    padding: 0 10px;
    font-size: var(--gt-text-sm);
  }

  .gt-input--md {
    height: 36px;
    padding: 0 12px;
    font-size: var(--gt-text-md);
  }

  .gt-input--lg {
    height: 44px;
    padding: 0 14px;
    font-size: var(--gt-text-lg);
  }

  .gt-input__prompt {
    color: var(--gt-fg-faint);
    user-select: none;
  }

  .gt-input__box {
    position: relative;
    display: inline-flex;
    flex: 1;
    min-width: 0;
  }

  .gt-input__field {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
  }

  .gt-input__field::placeholder {
    color: var(--gt-fg-faint);
  }

  .gt-input--block-caret .gt-input__field {
    caret-color: transparent;
  }

  .gt-input__caret {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--gt-fg);
    animation: gt-blink var(--gt-caret-blink) steps(1) infinite;
  }

  /* The invalid state is monochrome, so it uses a dashed border instead of red. */
  .gt-input--invalid {
    --gt-border-alpha: 0.4;
    border-style: dashed;
  }

  .gt-input--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
</style>
