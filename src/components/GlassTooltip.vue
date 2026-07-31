<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useGlassId } from '../internal/useId'
import type { GlassTooltipProps } from '../types'

const props = withDefaults(defineProps<GlassTooltipProps>(), {
  content: '',
  placement: 'top',
  delay: 200,
  disabled: false,
})

const open = ref(false)
const tooltipId = useGlassId('gt-tooltip')
let timer: ReturnType<typeof setTimeout> | undefined

const { anchorAttrs, floatingRef, placement } = useFloating({
  placement: () => props.placement,
  offset: 8,
  open,
  onHidden: () => hide(),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, radius: 'sm', grain: false })

function show() {
  if (props.disabled) return
  clearTimeout(timer)
  timer = setTimeout(() => (open.value = true), props.delay)
}

function hide() {
  clearTimeout(timer)
  open.value = false
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span
    v-bind="anchorAttrs"
    class="gt-tooltip__anchor"
    :aria-describedby="open ? tooltipId : undefined"
    @pointerenter="show"
    @pointerleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown.esc="hide"
  >
    <slot />
    <Teleport to="body">
      <!-- Fixed and teleported: fixed coordinates are viewport coordinates,
           which is exactly what getBoundingClientRect returns, and outside the
           tree no ancestor transform can redefine what fixed means. -->
      <Transition name="gt-tooltip">
        <div
          v-if="open"
          :id="tooltipId"
          class="gt-tooltip"
          :class="`gt-tooltip--${placement.split('-')[0]}`"
          role="tooltip"
          v-bind="surfaceAttrs"
        >
          <slot name="content">{{ content }}</slot>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style src="./GlassTooltip.css"></style>
