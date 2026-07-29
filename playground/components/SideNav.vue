<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface NavItem {
  id: string
  label: string
}

const props = defineProps<{ items: readonly NavItem[] }>()

const active = ref(props.items[0]?.id ?? '')
let observer: IntersectionObserver | undefined

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
  <nav class="nav" aria-label="Navegação da página">
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
  top: 32px;
  align-self: start;
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
