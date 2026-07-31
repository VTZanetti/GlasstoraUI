<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import GlassKbd from './GlassKbd.vue'
import GlassModal from './GlassModal.vue'
import { useControllable } from '../composables/useControllable'
import { useRovingTabIndex } from '../composables/useRovingTabIndex'
import { matchesQuery } from '../internal/matchQuery'
import { useGlassId } from '../internal/useId'
import type { GlassCommand, GlassCommandPaletteProps } from '../types'

const props = withDefaults(defineProps<GlassCommandPaletteProps>(), {
  modelValue: undefined,
  hotkey: 'mod+k',
  placeholder: 'Type a command…',
  noResultsLabel: 'No results',
  label: 'Command palette',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [command: GlassCommand]
}>()

const listId = useGlassId('gt-palette-list')
const listRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')

// Undefined modelValue leaves the palette in charge of itself, which is what
// lets the hotkey open it with nothing wired up above.
const { value: open, setValue: setOpen } = useControllable(
  () => props.modelValue,
  (value) => emit('update:modelValue', value),
  false,
)

interface PaletteEntry {
  command: GlassCommand
  /** Position in the flattened list, which is the order the options render in. */
  index: number
}

interface PaletteGroup {
  key: string
  label: string | undefined
  entries: PaletteEntry[]
}

const groups = computed<PaletteGroup[]>(() => {
  const list: PaletteGroup[] = []
  const byKey = new Map<string, PaletteGroup>()

  for (const command of props.commands) {
    if (!matchesQuery(query.value, command.label, ...(command.keywords ?? []))) continue
    const key = command.group ?? ''
    let group = byKey.get(key)
    if (!group) {
      group = { key, label: command.group, entries: [] }
      byKey.set(key, group)
      list.push(group)
    }
    group.entries.push({ command, index: 0 })
  }

  // Grouping reorders the commands, so the flat index is numbered afterwards:
  // it has to agree with the document order the roving index reads.
  let index = 0
  for (const group of list) for (const entry of group.entries) entry.index = index++
  return list
})

const results = computed(() => groups.value.flatMap((group) => group.entries.map((e) => e.command)))

const optionId = (index: number) => `${listId}-option-${index}`

const roving = useRovingTabIndex({
  container: listRef,
  selector: '[role="option"]',
  // The focus belongs to the search box; the list is driven by reference.
  focus: 'activedescendant',
  activation: 'manual',
  onActivate: (element) => {
    const command = results.value[Number(element.dataset.index)]
    if (command && !command.disabled) run(command)
  },
})

// Derived from the data rather than from the DOM: the list is rebuilt on every
// keystroke, and an id read out of the previous one would point at a node that
// has already left the document.
const enabled = computed(() => results.value.filter((command) => !command.disabled))
const active = computed<GlassCommand | undefined>(() => enabled.value[roving.activeIndex.value])
const activeId = computed(() => {
  const index = active.value ? results.value.indexOf(active.value) : -1
  return index === -1 ? undefined : optionId(index)
})

function run(command: GlassCommand) {
  if (command.disabled) return
  emit('select', command)
  query.value = ''
  setOpen(false)
}

function hover(command: GlassCommand) {
  const index = enabled.value.indexOf(command)
  if (index !== -1) roving.setActive(index)
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}

function onKeydown(event: KeyboardEvent) {
  // Home and End are left alone: in a text box they belong to the caret.
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
    roving.onKeydown(event)
  }
}

interface Hotkey {
  key: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
}

/** Meta is the command key on Apple hardware, Control is it everywhere else. */
function onApple(): boolean {
  if (typeof navigator === 'undefined') return false
  const source = navigator.platform || navigator.userAgent || ''
  return /mac|iphone|ipad|ipod/i.test(source)
}

const hotkey = computed<Hotkey | null>(() => {
  const parts = props.hotkey
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  const key = parts.pop()
  if (!key) return null
  const has = (...names: string[]) => names.some((name) => parts.includes(name))
  const mod = has('mod')
  return {
    key,
    ctrl: has('ctrl', 'control') || (mod && !onApple()),
    meta: has('meta', 'cmd', 'command') || (mod && onApple()),
    shift: has('shift'),
    alt: has('alt', 'option'),
  }
})

function onHotkey(event: KeyboardEvent) {
  const combo = hotkey.value
  if (!combo || event.key.toLowerCase() !== combo.key) return
  if (event.ctrlKey !== combo.ctrl || event.metaKey !== combo.meta) return
  if (event.shiftKey !== combo.shift || event.altKey !== combo.alt) return
  // Most of these combinations mean something to the browser too, and it would
  // act on them as well.
  event.preventDefault()
  setOpen(!open.value)
}

onMounted(() => document.addEventListener('keydown', onHotkey))
onBeforeUnmount(() => document.removeEventListener('keydown', onHotkey))

watch(
  open,
  async (isOpen) => {
    if (!isOpen) return
    // The modal focuses its own panel a tick after it opens, so the search box
    // can only take the focus after that has happened.
    await nextTick()
    await nextTick()
    inputRef.value?.focus()
    roving.refresh()
    roving.setActive(0)
  },
  // A palette mounted open never changes state, and would keep neither the
  // focus nor the first result.
  { immediate: true },
)

// Every keystroke rebuilds the list, so the active option goes back to the first
// result rather than to whatever is left at that index.
watch(results, async () => {
  if (!open.value) return
  await nextTick()
  roving.refresh()
  roving.setActive(0)
})
</script>

<template>
  <GlassModal
    class="gt-palette"
    :model-value="open"
    :closable="false"
    :aria-label="label"
    width="34rem"
    @update:model-value="setOpen"
  >
    <div class="gt-palette__search">
      <span class="gt-palette__prompt" aria-hidden="true">&gt;</span>
      <input
        ref="inputRef"
        class="gt-palette__input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        :aria-label="placeholder"
        :placeholder="placeholder"
        :value="query"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>

    <div :id="listId" ref="listRef" class="gt-palette__list" role="listbox" :aria-label="label">
      <div
        v-for="group in groups"
        :key="group.key"
        class="gt-palette__group"
        role="group"
        :aria-label="group.label"
      >
        <div v-if="group.label" class="gt-palette__group-label" aria-hidden="true">
          {{ group.label }}
        </div>

        <div
          v-for="entry in group.entries"
          :id="optionId(entry.index)"
          :key="entry.command.id"
          class="gt-palette__option"
          :class="{ 'gt-palette__option--active': entry.command === active }"
          role="option"
          :aria-selected="entry.command === active"
          :aria-disabled="entry.command.disabled || undefined"
          :data-index="entry.index"
          @click="run(entry.command)"
          @pointermove="entry.command.disabled || hover(entry.command)"
        >
          <slot name="command" :command="entry.command">
            <span class="gt-palette__label">{{ entry.command.label }}</span>
            <GlassKbd v-if="entry.command.shortcut" class="gt-palette__shortcut">
              {{ entry.command.shortcut }}
            </GlassKbd>
          </slot>
        </div>
      </div>

      <div v-if="!results.length" class="gt-palette__empty">
        <slot name="empty">{{ noResultsLabel }}</slot>
      </div>
    </div>
  </GlassModal>
</template>

<style src="./GlassCommandPalette.css"></style>
