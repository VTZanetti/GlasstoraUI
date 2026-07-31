<script setup lang="ts">
import { computed } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useGlassId } from '../internal/useId'
import type { GlassAccordionItem, GlassAccordionProps } from '../types'

const props = withDefaults(defineProps<GlassAccordionProps>(), {
  modelValue: undefined,
  multiple: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  change: [value: string | string[]]
}>()

const baseId = useGlassId('gt-accordion')

const { surfaceAttrs } = useGlassSurface({ radius: 'md' })

// Nothing open is '' or [] rather than undefined, which useControllable reads
// as the consumer not owning the value at all.
const { value: openValue, setValue: setOpenValue } = useControllable<string | string[]>(
  () => props.modelValue,
  (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
  () => (props.multiple ? [] : ''),
)

const openList = computed(() => {
  const current = openValue.value
  if (Array.isArray(current)) return current
  return current ? [current] : []
})

function isOpen(value: string) {
  return openList.value.includes(value)
}

function triggerId(index: number) {
  return `${baseId}-trigger-${index}`
}

function regionId(index: number) {
  return `${baseId}-region-${index}`
}

function toggle(item: GlassAccordionItem) {
  // The button is disabled too. This guard is what holds when a click arrives
  // anyway, from a synthetic event or a stale item list.
  if (item.disabled) return
  if (!props.multiple) {
    setOpenValue(isOpen(item.value) ? '' : item.value)
    return
  }
  // A new array every time. useControllable compares by identity, so a mutated
  // one would read as unchanged and never reach the consumer.
  setOpenValue(
    isOpen(item.value)
      ? openList.value.filter((value) => value !== item.value)
      : [...openList.value, item.value],
  )
}
</script>

<template>
  <div class="gt-accordion" :class="`gt-accordion--${size}`" v-bind="surfaceAttrs">
    <div
      v-for="(item, index) in items"
      :key="item.value"
      class="gt-accordion__item"
      :class="{
        'gt-accordion__item--open': isOpen(item.value),
        'gt-accordion__item--disabled': item.disabled,
      }"
    >
      <h3 class="gt-accordion__heading">
        <button
          :id="triggerId(index)"
          type="button"
          class="gt-accordion__trigger"
          :aria-expanded="isOpen(item.value)"
          :aria-controls="regionId(index)"
          :disabled="item.disabled"
          @click="toggle(item)"
        >
          <span class="gt-accordion__title">
            <slot name="title" :item="item" :open="isOpen(item.value)">{{ item.title }}</slot>
          </span>
          <span class="gt-accordion__marker" aria-hidden="true">▸</span>
        </button>
      </h3>
      <div
        :id="regionId(index)"
        class="gt-accordion__region"
        role="region"
        :aria-labelledby="triggerId(index)"
      >
        <div class="gt-accordion__panel">
          <div class="gt-accordion__content">
            <slot v-if="$slots[item.value]" :name="item.value" :item="item" />
            <slot v-else name="content" :item="item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./GlassAccordion.css"></style>
