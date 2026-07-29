<script setup lang="ts">
import { computed, ref } from 'vue'
import { GlassProvider } from 'glasstora'
import SideNav from './components/SideNav.vue'
import HeroSection from './sections/HeroSection.vue'
import InstallSection from './sections/InstallSection.vue'
import LightLab from './sections/LightLab.vue'
import LightInspector from './sections/LightInspector.vue'
import ComponentsShowcase from './sections/ComponentsShowcase.vue'

/* Driven by the GlassProvider card in the showcase, so visitors can see how
   each option affects the whole page. */
const grain = ref(true)
const refraction = ref('auto')
const theme = ref('dark')
const refractionMode = computed(() => refraction.value as 'auto' | 'on' | 'off')
const themeMode = computed(() => theme.value as 'dark' | 'light' | 'auto')

const navItems = [
  { id: 'inicio', label: 'início' },
  { id: 'instalacao', label: 'instalação' },
  { id: 'fisica', label: 'física da luz' },
  { id: 'inspetor', label: 'inspetor de luz' },
  { id: 'provider', label: 'GlassProvider' },
  { id: 'surface', label: 'GlassSurface' },
  { id: 'card', label: 'GlassCard' },
  { id: 'divider', label: 'GlassDivider' },
  { id: 'button', label: 'GlassButton' },
  { id: 'field', label: 'GlassField' },
  { id: 'input', label: 'GlassInput' },
  { id: 'textarea', label: 'GlassTextarea' },
  { id: 'checkbox', label: 'GlassCheckbox' },
  { id: 'switch', label: 'GlassSwitch' },
  { id: 'kbd', label: 'GlassKbd' },
  { id: 'badge', label: 'GlassBadge' },
  { id: 'avatar', label: 'GlassAvatar' },
  { id: 'spinner', label: 'GlassSpinner' },
  { id: 'skeleton', label: 'GlassSkeleton' },
  { id: 'progress', label: 'GlassProgress' },
  { id: 'alert', label: 'GlassAlert' },
  { id: 'tooltip', label: 'GlassTooltip' },
  { id: 'popover', label: 'GlassPopover' },
  { id: 'modal', label: 'GlassModal' },
  { id: 'terminal', label: 'GlassTerminal' },
]
</script>

<template>
  <GlassProvider :refraction="refractionMode" :grain="grain" :theme="themeMode">
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
          <LightInspector />
          <ComponentsShowcase
            v-model:grain="grain"
            v-model:refraction="refraction"
            v-model:theme="theme"
          />
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
