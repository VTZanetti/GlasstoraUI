<script lang="ts">
import { ref } from 'vue'

/**
 * Every mounted outlet, oldest first.
 *
 * Module scope, because a <script setup> body runs once per instance and the
 * outlets have to be able to see each other. The queue is a singleton, so two
 * outlets left rendering at once would show every toast twice.
 */
const outlets = ref<symbol[]>([])
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { registerSurface, type SurfaceHandle } from '../internal/lightRegistry'
import { glassClasses } from '../internal/surfaceClasses'
import { useToast } from '../composables/useToast'
import type { GlassToastProps, GlassToastVariant } from '../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GlassToastProps>(), {
  position: 'bottom-right',
  max: 0,
  closeLabel: 'Dismiss',
})

const { toasts, dismiss, pauseAll, resumeAll } = useToast()

/**
 * Past the cap the oldest are taken down, not merely hidden.
 *
 * Hiding them left their countdowns running behind the cap, so a burst of
 * notifications kept surfacing minutes later as the visible ones expired and
 * uncovered the backlog. A cap on what is drawn is not a cap on the queue.
 */
watch(
  () => [props.max, toasts.value.length] as const,
  ([max, length]) => {
    if (!isActive.value || max <= 0 || length <= max) return
    for (const toast of toasts.value.slice(0, length - max)) dismiss(toast.id)
  },
  { flush: 'post' },
)

const token = Symbol('gt-toast-outlet')

// The newest outlet wins, the way the dismissable stack hands Escape to the
// topmost layer. A second one usually means a stray outlet in a layout that was
// mounted twice, which is worth saying out loud while developing.
const isActive = computed(() => outlets.value[outlets.value.length - 1] === token)

onMounted(() => {
  outlets.value.push(token)
  if (import.meta.env.DEV && outlets.value.length > 1) {
    console.warn(
      '[glasstora] More than one GlassToast outlet is mounted. ' +
        'The last one renders the queue; the others stay empty.',
    )
  }
})

/** Past the cap the oldest drop off the top, so the newest are always shown. */
const visible = computed(() =>
  props.max > 0 ? toasts.value.slice(-props.max) : toasts.value.slice(),
)

/** The palette carries no colour, so the variant reads as a glyph and a rule. */
const MARKS = { info: 'i', warn: '!', error: '×', success: '✓' } as const
const markOf = (variant: GlassToastVariant | undefined) => MARKS[variant ?? 'info']

// One class list for every item, since none of it depends on the toast.
const itemClasses = glassClasses({ elevation: 2, radius: 'md' })

/**
 * The light per item, wired by hand instead of with v-glass.
 *
 * A directive drops its classes at the start of the leave transition, which
 * would strip the glass off a toast while it is still fading out. Binding the
 * classes and registering the element separately keeps the surface intact until
 * it is really gone; releasing the light early only freezes the highlight,
 * which nothing can see over a quarter of a second of fade.
 */
const handles = new Map<number, SurfaceHandle>()
const itemRefs = new Map<number, (el: unknown) => void>()

function litItem(el: unknown, id: number) {
  if (!el) {
    handles.get(id)?.release()
    handles.delete(id)
    itemRefs.delete(id)
    return
  }
  // Idempotent: a re-render calls the ref again with the same element, and
  // registering twice would leave the first handle able to detach the second.
  if (handles.has(id)) return
  handles.set(id, registerSurface(el as HTMLElement, {}))
}

/**
 * One callback per toast, kept for as long as the toast is.
 *
 * An arrow written inline in the template is a different function on every
 * render, and Vue reads a changed ref as the old element leaving: each render
 * of the list released every surface and registered it again. With a burst of
 * notifications that churn is per frame, which is exactly when the light engine
 * has the least to spare.
 */
function itemRef(id: number) {
  let fn = itemRefs.get(id)
  if (!fn) {
    fn = (el: unknown) => litItem(el, id)
    itemRefs.set(id, fn)
  }
  return fn
}

onBeforeUnmount(() => {
  const index = outlets.value.lastIndexOf(token)
  if (index !== -1) outlets.value.splice(index, 1)
  // Belt and braces: Vue unsets the item refs on its way out, but an outlet
  // torn down mid transition must not leave surfaces in the registry.
  for (const handle of handles.values()) handle.release()
  handles.clear()
  itemRefs.clear()
})
</script>

<template>
  <Teleport to="body">
    <!-- The region is a plain element rather than the TransitionGroup's own
         tag: the live region has to exist and keep its identity while toasts
         come and go, and the group is only how the children are animated. -->
    <div
      v-if="isActive"
      class="gt-toast"
      :class="`gt-toast--${position}`"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      v-bind="$attrs"
      @mouseenter="pauseAll"
      @mouseleave="resumeAll"
      @focusin="pauseAll"
      @focusout="resumeAll"
    >
      <TransitionGroup name="gt-toast" tag="div" class="gt-toast__list">
        <div
          v-for="toast in visible"
          :key="toast.id"
          :ref="itemRef(toast.id)"
          class="gt-toast__item"
          :class="[itemClasses, `gt-toast__item--${toast.variant ?? 'info'}`]"
          :role="toast.variant === 'error' ? 'alert' : 'status'"
        >
          <span class="gt-toast__mark" aria-hidden="true">{{ markOf(toast.variant) }}</span>
          <div class="gt-toast__content">
            <p v-if="toast.title" class="gt-toast__title">{{ toast.title }}</p>
            <p class="gt-toast__message">{{ toast.message }}</p>
          </div>
          <button
            v-if="toast.closable !== false"
            class="gt-toast__close"
            type="button"
            :aria-label="closeLabel"
            @click="dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style src="./GlassToast.css"></style>
