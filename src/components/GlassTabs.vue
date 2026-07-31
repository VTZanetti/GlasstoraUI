<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import { useControllable } from '../composables/useControllable'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useGlassId } from '../internal/useId'
import { tabsKey } from '../internal/keys'
import type { GlassTabsProps } from '../types'

const props = withDefaults(defineProps<GlassTabsProps>(), {
  modelValue: undefined,
  activation: 'automatic',
  size: 'md',
  label: 'Tabs',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const listRef = ref<HTMLElement | null>(null)
const groupId = useGlassId('gt-tabs')
// The list is the glass, and surfaceAttrs carries its own function ref, so the
// ref is handed over here rather than declared again in the template. Declaring
// both would leave whichever Vue applied second holding the element.
const { surfaceAttrs } = useGlassSurface({ el: listRef, radius: 'md', grain: false })

// A value is free text, and ids are not: spaces and accents would break the
// aria-controls pairing. Deriving both halves from the same slug is what lets
// tab and panel find each other without registering with one another.
const slug = (value: string) => value.replace(/[^a-zA-Z0-9_-]+/g, '-')
const tabId = (value: string) => `${groupId}-tab-${slug(value)}`
const panelId = (value: string) => `${groupId}-panel-${slug(value)}`

const firstEnabled = computed(() => props.tabs.find((tab) => !tab.disabled)?.value)

const { value: active, setValue } = useControllable<string | undefined>(
  () => props.modelValue,
  (next) => {
    if (next === undefined) return
    emit('update:modelValue', next)
    emit('change', next)
  },
  firstEnabled,
)

function select(value: string) {
  setValue(value)
}

const roving = useRovingTabIndex({
  container: listRef,
  selector: '[role="tab"]',
  orientation: 'horizontal',
  activation: () => props.activation,
  onActivate: (element) => {
    const value = element.dataset.value
    if (value !== undefined) select(value)
  },
})

provide(tabsKey, {
  active: computed(() => active.value),
  groupId,
  tabId,
  panelId,
})

// The tab stop follows the selection, and the list can change under it. Watched
// by length rather than deeply, because one of the sources is a DOM element and
// a deep watcher would walk the whole node.
watch(
  [active, () => props.tabs.length, listRef],
  async () => {
    await nextTick()
    const items = roving.items()
    if (!items.length) return
    const selected = items.findIndex((item) => item.dataset.value === active.value)
    roving.setActive(selected === -1 ? 0 : selected)
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <div class="gt-tabs" :class="`gt-tabs--${size}`">
    <div
      class="gt-tabs__list"
      role="tablist"
      :aria-label="label"
      v-bind="surfaceAttrs"
      @keydown="roving.onKeydown"
    >
      <button
        v-for="tab in tabs"
        :id="tabId(tab.value)"
        :key="tab.value"
        class="gt-tabs__tab"
        :class="{ 'gt-tabs__tab--on': tab.value === active }"
        type="button"
        role="tab"
        :aria-selected="tab.value === active"
        :aria-controls="panelId(tab.value)"
        :disabled="tab.disabled"
        :data-value="tab.value"
        @click="select(tab.value)"
      >
        <slot name="tab" :tab="tab" :selected="tab.value === active">{{ tab.label }}</slot>
      </button>
    </div>
    <slot />
  </div>
</template>

<style src="./GlassTabs.css"></style>
