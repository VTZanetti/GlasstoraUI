<script setup lang="ts">
import { GlassBadge, GlassSurface, useGlassLight } from 'glasstora'

const light = useGlassLight()

const ASCII_ART = String.raw`
+--------------------------------------------------------------------------+
|  GLASSTORA // CAMARA DE REFRACAO                                         |
|  ////////////////////////////////////////////////////////////////////    |
|                                                                          |
|  01  o fundo que voce le agora atravessa o vidro sobre ele               |
|  02  em navegadores Chromium um filtro SVG distorce estas linhas         |
|  03  nos demais o efeito vira blur, sem quebrar o layout                 |
|                                                                          |
|  ..::??##  L I Q U I D   M O N O C H R O M E  ##??::..                   |
|                                                                          |
|  > backdrop-filter: url(#gt-refraction) blur(14px)                       |
|  > background-attachment: fixed                                          |
|  > --gt-light-x / --gt-light-y                                           |
|                                                                          |
|  +---------+ +---------+ +---------+ +---------+ +---------+ +---------+ |
|  |         | |         | |         | |         | |         | |         | |
|  +---------+ +---------+ +---------+ +---------+ +---------+ +---------+ |
|  ////////////////////////////////////////////////////////////////////    |
+--------------------------------------------------------------------------+
`
</script>

<template>
  <section id="fisica">
    <p class="demo-kicker">01 · física da luz</p>
    <h2 class="demo-h2">Uma fonte de luz para a página inteira</h2>
    <p class="demo-lead">
      Um único listener de <code>pointermove</code>, limitado por
      <code>requestAnimationFrame</code>, escreve duas variáveis CSS no elemento raiz. Todo vidro da
      página reage em conjunto, incluindo o brilho central e o ponto quente na borda. Mova o cursor
      para ver o efeito.
    </p>
    <div class="lab">
      <pre class="lab__ascii" aria-hidden="true">{{ ASCII_ART }}</pre>
      <div class="lab__grid">
        <GlassSurface interactive :elevation="2">
          <p class="lab__label">refração</p>
          <p class="lab__text">o texto atrás desta placa se distorce em navegadores Chromium</p>
        </GlassSurface>
        <GlassSurface interactive :elevation="2">
          <p class="lab__label">brilho</p>
          <p class="lab__text">o reflexo acompanha o cursor em todas as placas ao mesmo tempo</p>
        </GlassSurface>
        <GlassSurface interactive :elevation="2">
          <p class="lab__label">condensação</p>
          <p class="lab__text">com o mouse sobre a placa o vidro embaça e o blur aumenta</p>
        </GlassSurface>
      </div>
    </div>
    <div class="lab__readout">
      <GlassBadge :pulse="light.mode.value !== 'static'">
        luz {{ Math.round(light.x.value) }} x {{ Math.round(light.y.value) }} px, modo
        {{ light.mode.value }}
      </GlassBadge>
    </div>
  </section>
</template>

<style scoped>
.lab {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.lab__ascii {
  margin: 0;
  padding: 20px;
  font-size: 12px;
  line-height: 1.5;
  color: #6b6b6b;
  user-select: none;
  white-space: pre;
  overflow: hidden;
}

.lab__grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: center;
  padding: 28px;
}

.lab__label {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #f5f5f5;
}

.lab__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #9e9e9e;
}

.lab__readout {
  margin-top: 18px;
}

@media (max-width: 720px) {
  .lab__grid {
    grid-template-columns: 1fr;
    align-content: center;
  }
}
</style>
