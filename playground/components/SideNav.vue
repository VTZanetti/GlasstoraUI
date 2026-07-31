<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface NavItem {
  id: string
  label: string
}

const props = defineProps<{ items: readonly NavItem[] }>()

const active = ref(props.items[0]?.id ?? '')
const listRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | undefined

// The list scrolls inside its own column now, so the entry being highlighted
// can sit outside the part of it that is on screen.
watch(active, (id) => {
  listRef.value?.querySelector(`a[href="#${id}"]`)?.scrollIntoView({ block: 'nearest' })
})

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) active.value = visible[0].target.id
    },
    { rootMargin: '-10% 0px -70% 0px' },
  )
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav ref="listRef" class="nav" aria-label="Navegação da página">
    <ul class="nav__list">
      <li v-for="item in items" :key="item.id">
        <a
          class="nav__link"
          :class="{ 'nav__link--active': item.id === active }"
          :href="`#${item.id}`"
          :aria-current="item.id === active ? 'true' : undefined"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav {
  position: sticky;
  /* Far enough down that the hero buttons clear the list instead of sitting on
     top of it while the page scrolls past them. */
  top: 64px;
  align-self: start;
  /* At thirty six components the list is taller than a laptop viewport, and a
     sticky column that overflows puts its last entries out of reach for good,
     since it does not scroll with the page. It scrolls, but without drawing a
     bar: this is a quiet index beside the content, and the active entry is
     brought into view on its own as the page moves. */
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav__link {
  display: block;
  padding: 5px 0 5px 12px;
  font-size: 12px;
  color: var(--gt-fg-faint);
  text-decoration: none;
  border-left: 1px solid rgb(var(--gt-line-tint) / 0.1);
  transition:
    color 120ms ease,
    border-color 120ms ease;
}

.nav__link:hover {
  color: var(--gt-gray-8);
}

.nav__link--active {
  color: var(--gt-fg);
  border-left-color: var(--gt-fg);
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
}
</style>
