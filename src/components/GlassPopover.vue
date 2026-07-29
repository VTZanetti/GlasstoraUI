<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useDismissable } from '../composables/useDismissable'
import { useFloating } from '../composables/useFloating'
import { useGlassSurface } from '../composables/useGlassSurface'
import { useGlassId } from '../internal/useId'
import type { GlassPopoverProps } from '../types'

const props = withDefaults(defineProps<GlassPopoverProps>(), {
  modelValue: undefined,
  placement: 'bottom-start',
  closeOnOutside: true,
  closeOnEsc: true,
  offset: 8,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

const panelId = useGlassId('gt-popover')
const uncontrolled = ref(false)
// Works with or without v-model. Passing modelValue takes control, leaving it
// out lets the component keep its own state.
const open = computed(() => props.modelValue ?? uncontrolled.value)

const { anchorAttrs, anchorRef, floatingRef, placement } = useFloating({
  placement: () => props.placement,
  offset: () => props.offset,
  open,
  onHidden: () => setOpen(false),
})

const { surfaceAttrs } = useGlassSurface({ el: floatingRef, elevation: 2, radius: 'md' })

let previouslyFocused: HTMLElement | null = null

function setOpen(value: boolean) {
  if (value === open.value) return
  if (props.modelValue === undefined) uncontrolled.value = value
  emit('update:modelValue', value)
  if (!value) emit('close')
}

function toggle() {
  setOpen(!open.value)
}

useDismissable({
  open,
  inside: [anchorRef, floatingRef],
  escape: () => props.closeOnEsc,
  outside: () => props.closeOnOutside,
  onDismiss: () => setOpen(false),
})

watch(open, async (value) => {
  if (typeof document === 'undefined') return
  if (value) {
    previouslyFocused = document.activeElement as HTMLElement | null
    await nextTick()
    floatingRef.value?.focus()
  } else {
    previouslyFocused?.focus?.()
    previouslyFocused = null
  }
})

defineExpose({ open, setOpen, toggle })
</script>

<template>
  <span class="gt-popover__anchor" v-bind="anchorAttrs">
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle"
      :attrs="{ 'aria-expanded': open, 'aria-controls': panelId }"
    >
      <button
        class="gt-popover__trigger"
        type="button"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggle"
      >
        <slot name="label">…</slot>
      </button>
    </slot>
    <Teleport to="body">
      <Transition name="gt-popover">
        <div
          v-if="open"
          :id="panelId"
          class="gt-popover"
          :class="`gt-popover--${placement.split('-')[0]}`"
          role="dialog"
          tabindex="-1"
          v-bind="surfaceAttrs"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
@layer glasstora {
  .gt-popover__anchor {
    display: inline-flex;
  }

  .gt-popover__trigger {
    font: inherit;
    color: inherit;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .gt-popover {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 55;
    min-width: 12rem;
    max-width: min(26rem, calc(100vw - 32px));
    padding: 12px 14px;
    font-family: var(--gt-font-mono);
    font-size: var(--gt-text-sm);
    line-height: 1.6;
    color: var(--gt-fg-muted);
    outline: none;
    will-change: transform;
  }

  .gt-popover:focus-visible {
    outline: 1px solid rgb(var(--gt-line-tint) / var(--gt-focus-alpha));
    outline-offset: 2px;
  }

  /* Only opacity moves. The transform belongs to useFloating, and animating it
     here would fight the positioner for the same property. */
  .gt-popover-enter-active,
  .gt-popover-leave-active {
    transition: opacity var(--gt-dur-1) var(--gt-ease);
  }

  .gt-popover-enter-from,
  .gt-popover-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-popover-enter-active,
    .gt-popover-leave-active {
      transition: none;
    }
  }
}
</style>
