<script setup lang="ts">
import { GlassProvider } from 'glasstora'
import HeroSection from './sections/HeroSection.vue'
import LightLab from './sections/LightLab.vue'
import GallerySection from './sections/GallerySection.vue'
</script>

<template>
  <GlassProvider>
    <div class="demo-backdrop" aria-hidden="true">
      <div class="demo-orb demo-orb--a" />
      <div class="demo-orb demo-orb--b" />
    </div>
    <main class="demo-main">
      <HeroSection />
      <LightLab />
      <GallerySection />
      <footer class="demo-footer">
        <span>MIT © 2026 Vitor Zanetti</span>
        <a href="https://github.com/VTZanetti/GlasstoraUI" target="_blank" rel="noreferrer">
          github.com/VTZanetti/GlasstoraUI
        </a>
      </footer>
    </main>
  </GlassProvider>
</template>
