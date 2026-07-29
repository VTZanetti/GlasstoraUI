<script setup lang="ts">
import { computed, mergeProps, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { trapFocus } from '../internal/focusTrap'
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
let prevActive: HTMLElement | null = null
let prevOverflow = ''
let prevPaddingRight = ''

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
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = prevOverflow
  document.documentElement.style.paddingRight = prevPaddingRight
  prevActive?.focus?.()
  prevActive = null
}

watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      prevActive = document.activeElement as HTMLElement | null
      const root = document.documentElement
      prevOverflow = root.style.overflow
      prevPaddingRight = root.style.paddingRight
      // Hiding the page scrollbar hands its width back to the layout and the
      // whole page shifts. Reserve the same width as padding while locked.
      // Measured before the lock, since hiding the bar changes clientWidth.
      const scrollbarGap = window.innerWidth - root.clientWidth
      if (scrollbarGap > 0) root.style.paddingRight = `${scrollbarGap}px`
      root.style.overflow = 'hidden'
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

<style>
@layer glasstora {
  .gt-modal {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 24px;
    font-family: var(--gt-font-mono);
  }

  .gt-modal__overlay {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 0.6);
  }

  /* The panel itself never scrolls. Its ::after ring sits 1px outside the box,
     which a scroll container would count as overflow and grow scrollbars for,
     besides clipping the ring. The body below is the scroll area instead. */
  .gt-modal__panel {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    max-height: calc(100vh - 48px);
    color: var(--gt-fg);
    border-radius: var(--gt-radius-lg);
    outline: none;
  }

  .gt-modal__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px 0;
  }

  .gt-modal__title {
    margin: 0;
    font-size: var(--gt-text-lg);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .gt-modal__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid rgb(var(--gt-line-tint) / var(--gt-fill-strong-alpha));
    border-radius: var(--gt-radius-sm);
    color: var(--gt-fg-muted);
    font-family: inherit;
    font-size: var(--gt-text-sm);
    cursor: pointer;
    transition: color var(--gt-dur-1) var(--gt-ease);
  }

  .gt-modal__close:hover {
    color: var(--gt-fg);
  }

  .gt-modal__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden auto;
    padding: 16px 20px;
    color: var(--gt-fg-muted);
    line-height: 1.7;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--gt-line-tint) / var(--gt-line-strong-alpha)) transparent;
  }

  .gt-modal__footer {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 20px 20px;
  }

  /* Transition */
  .gt-modal-enter-active,
  .gt-modal-leave-active {
    transition: opacity var(--gt-dur-2) var(--gt-ease);
  }

  .gt-modal-enter-active .gt-modal__panel,
  .gt-modal-leave-active .gt-modal__panel {
    transition: transform var(--gt-dur-2) var(--gt-ease);
  }

  .gt-modal-enter-from,
  .gt-modal-leave-to {
    opacity: 0;
  }

  .gt-modal-enter-from .gt-modal__panel,
  .gt-modal-leave-to .gt-modal__panel {
    transform: translateY(8px) scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .gt-modal-enter-active,
    .gt-modal-leave-active,
    .gt-modal-enter-active .gt-modal__panel,
    .gt-modal-leave-active .gt-modal__panel {
      transition: none !important;
    }
  }
}
</style>
