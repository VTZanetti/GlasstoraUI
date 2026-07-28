<script setup lang="ts">
import { computed, ref } from 'vue'
import { GlassProvider } from 'glasstora'
import SideNav from './components/SideNav.vue'
import HeroSection from './sections/HeroSection.vue'
import InstallSection from './sections/InstallSection.vue'
import LightLab from './sections/LightLab.vue'
import ComponentsShowcase from './sections/ComponentsShowcase.vue'

/* Driven by the GlassProvider card in the showcase, so visitors can see how
   each option affects the whole page. */
const grain = ref(true)
const refraction = ref('auto')
const refractionMode = computed(() => refraction.value as 'auto' | 'on' | 'off')

const navItems = [
  { id: 'inicio', label: 'início' },
  { id: 'instalacao', label: 'instalação' },
  { id: 'fisica', label: 'física da luz' },
  { id: 'provider', label: 'GlassProvider' },
  { id: 'surface', label: 'GlassSurface' },
  { id: 'button', label: 'GlassButton' },
  { id: 'input', label: 'GlassInput' },
  { id: 'switch', label: 'GlassSwitch' },
  { id: 'kbd', label: 'GlassKbd' },
  { id: 'badge', label: 'GlassBadge' },
  { id: 'progress', label: 'GlassProgress' },
  { id: 'modal', label: 'GlassModal' },
  { id: 'terminal', label: 'GlassTerminal' },
]
</script>

<template>
  <GlassProvider :refraction="refractionMode" :grain="grain">
    <div class="demo-backdrop" aria-hidden="true">
      <div class="demo-orb demo-orb--a" />
      <div class="demo-orb demo-orb--b" />
    </div>

    <div class="demo-main">
      <HeroSection />

      <div class="demo-shell">
        <SideNav :items="navItems" />
        <main class="demo-content">
          <InstallSection />
          <LightLab />
          <ComponentsShowcase v-model:grain="grain" v-model:refraction="refraction" />
        </main>
      </div>

      <footer class="demo-footer">
        <span>MIT © 2026 Vitor Zanetti</span>
        <a href="https://github.com/VTZanetti/GlasstoraUI" target="_blank" rel="noreferrer">
          github.com/VTZanetti/GlasstoraUI
        </a>
      </footer>
    </div>
  </GlassProvider>
</template>
