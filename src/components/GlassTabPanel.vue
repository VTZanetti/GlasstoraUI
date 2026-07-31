<script setup lang="ts">
import { computed, inject } from 'vue'
import { tabsKey } from '../internal/keys'
import type { GlassTabPanelProps } from '../types'

const props = defineProps<GlassTabPanelProps>()

const tabs = inject(tabsKey, null)
const selected = computed(() => tabs?.active.value === props.value)
</script>

<template>
  <div
    v-show="selected"
    :id="tabs?.panelId(value)"
    class="gt-tabs__panel"
    role="tabpanel"
    :tabindex="selected ? 0 : -1"
    :aria-labelledby="tabs?.tabId(value)"
  >
    <slot />
  </div>
</template>

<style src="./GlassTabPanel.css"></style>
