<script setup lang="ts">
import { computed, mergeProps, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { trapFocus } from '../internal/focusTrap'
import { lockScroll } from '../internal/scrollLock'
import { useGlassId } from '../internal/useId'
import { useDismissable } from '../composables/useDismissable'
import { useGlassSurface } from '../composables/useGlassSurface'
import type { GlassModalProps } from '../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GlassModalProps>(), {
  title: '',
  width: '28rem',
  closeOnOverlay: true,
  closeOnEsc: true,
  closable: true,
  closeLabel: 'Close',
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()

const slots = defineSlots<{
  default?: () => unknown
  header?: () => unknown
  footer?: () => unknown
}>()

const panelRef = ref<HTMLElement | null>(null)
const titleId = useGlassId('gt-modal-title')

// Pointing at the heading beats repeating the string in an aria-label, but only
// when the heading is the one this component renders.
const ownTitle = computed(() => Boolean(props.title) && !slots.header)

// The panel animates in on a transform, which puts its own rect out of date on
// every frame of the transition. Measuring it each frame is what stops the
// highlight from sliding off while the dialog moves.
const { surfaceAttrs } = useGlassSurface({
  el: panelRef,
  elevation: 3,
  radius: 'lg',
  volatile: () => props.modelValue,
})

// The panel is teleported, so it carries the consumer's attributes rather than
// the component root. mergeProps is what keeps a class from the consumer and
// the glass classes both, instead of one replacing the other.
const attrs = useAttrs()
const panelAttrs = computed(() => mergeProps(surfaceAttrs.value, attrs))
let releaseTrap: (() => void) | undefined
let releaseScroll: (() => void) | undefined
let prevActive: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
  emit('close')
}

// Esc and outside click come from the same composable the popover uses, so the
// dismissal behaviour cannot drift between the two. The overlay covers the
// whole page, which is what makes any outside pointerdown land on it.
useDismissable({
  open: () => props.modelValue,
  inside: [panelRef],
  escape: () => props.closeOnEsc,
  outside: () => props.closeOnOverlay,
  onDismiss: close,
})

function teardown() {
  releaseTrap?.()
  releaseTrap = undefined
  releaseScroll?.()
  releaseScroll = undefined
  if (typeof document === 'undefined') return
  prevActive?.focus?.()
  prevActive = null
}

watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      prevActive = document.activeElement as HTMLElement | null
      releaseScroll = lockScroll()
      await nextTick()
      if (panelRef.value) {
        releaseTrap = trapFocus(panelRef.value)
        panelRef.value.focus()
      }
    } else {
      teardown()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (props.modelValue) teardown()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="gt-modal">
      <div v-if="modelValue" class="gt-modal">
        <div class="gt-modal__overlay" />
        <div
          class="gt-modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="ownTitle ? titleId : undefined"
          :aria-label="ownTitle ? undefined : title || undefined"
          :style="{ width }"
          tabindex="-1"
          v-bind="panelAttrs"
        >
          <!-- The close button used to live inside this condition, so a dialog
               with neither a title nor a header slot had no way out but Esc. -->
          <header v-if="title || $slots.header || closable" class="gt-modal__header">
            <slot name="header">
              <h2 v-if="title" :id="titleId" class="gt-modal__title">{{ title }}</h2>
              <span v-else />
            </slot>
            <button
              v-if="closable"
              class="gt-modal__close"
              type="button"
              :aria-label="closeLabel"
              @click="close()"
            >
              ✕
            </button>
          </header>
          <div class="gt-modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="gt-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./GlassModal.css"></style>
