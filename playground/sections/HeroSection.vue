<script setup lang="ts">
import { GlassBadge, GlassButton, GlassTerminal, VERSION } from 'glasstora'

const bootLines = [
  'npm i glasstora',
  'ok   vidro montado',
  'ok   luz calibrada',
  'ok   refracao ativa',
  'pronto. bem-vindo ao glasstora',
]

function scrollToGallery() {
  document.getElementById('componentes')?.scrollIntoView({ behavior: 'smooth' })
}

function openGitHub() {
  window.open('https://github.com/VTZanetti/GlasstoraUI', '_blank', 'noreferrer')
}
</script>

<template>
  <section id="inicio" class="hero">
    <p class="demo-kicker">glasstora ui · v{{ VERSION }}</p>
    <h1 class="hero__title">GLASSTORA</h1>
    <p class="hero__tagline">
      Componentes de vidro líquido para Vue 3, com refração real, uma fonte de luz global e paleta
      monocromática.
    </p>
    <div class="hero__badges">
      <GlassBadge>v{{ VERSION }}</GlassBadge>
      <GlassBadge variant="outline" :dot="false">MIT</GlassBadge>
      <GlassBadge variant="outline" :dot="false">Vue 3</GlassBadge>
      <GlassBadge variant="solid" :dot="false">sem dependências</GlassBadge>
    </div>
    <GlassTerminal class="hero__terminal" :lines="bootLines" typewriter scanlines :speed="26" />
    <div class="hero__actions">
      <GlassButton size="lg" @click="scrollToGallery">ver componentes</GlassButton>
      <GlassButton size="lg" variant="ghost" @click="openGitHub">github</GlassButton>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 96px;
}

.hero__title {
  margin: 0 0 16px;
  font-size: clamp(44px, 9vw, 96px);
  font-weight: 700;
  letter-spacing: 0.14em;
  line-height: 1;
}

.hero__tagline {
  margin: 0 0 24px;
  max-width: 58ch;
  color: var(--gt-fg-muted);
  line-height: 1.8;
  font-size: 15px;
}

.hero__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 40px;
}

.hero__terminal {
  max-width: 640px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
}
</style>
