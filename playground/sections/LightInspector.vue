<script setup lang="ts">
/*
 * An instrument, not a display case.
 *
 * Every cell of the grid is a context that broke the highlight in 0.1.0, when
 * it was positioned with background-attachment: fixed in viewport coordinates.
 * An ancestor carrying transform, filter or contain becomes the containing
 * block of a fixed background, and the highlight starts resolving against that
 * ancestor instead of against the screen. Here all of them have to agree on
 * one light source.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { GlassSurface, configureLight, useGlassLight, vGlass } from 'glasstora'
import RangeControl from '../components/RangeControl.vue'

const light = useGlassLight()

const falloff = ref(900)
const height = ref(520)
const gain = ref(100)

function applyTuning() {
  configureLight({ falloff: falloff.value, height: height.value, gain: gain.value / 100 })
}

const cases = [
  { id: 'plain', label: 'superfície normal', wrapper: '' },
  { id: 'transform', label: 'dentro de transform: rotate(0.001deg)', wrapper: 'is-transformed' },
  { id: 'filter', label: 'dentro de filter: blur(0)', wrapper: 'is-filtered' },
  { id: 'contain', label: 'dentro de contain: paint', wrapper: 'is-contained' },
  { id: 'scroll', label: 'dentro de container com scroll', wrapper: 'is-scroller' },
]

const probeRef = ref<HTMLElement | null>(null)
const readout = ref<Record<string, string>>({})
let frame = 0

/*
 * Reads what the browser actually resolved, rather than what the registry
 * believes it wrote. That is the difference between trusting the code and
 * checking the result.
 */
function sample() {
  const el = probeRef.value
  if (el) {
    const style = getComputedStyle(el)
    readout.value = {
      u: style.getPropertyValue('--gt-light-u').trim() || '-',
      v: style.getPropertyValue('--gt-light-v').trim() || '-',
      angulo: style.getPropertyValue('--gt-light-angle').trim() || '-',
      energia: style.getPropertyValue('--gt-light-energy').trim() || '-',
      incidencia: style.getPropertyValue('--gt-light-incidence').trim() || '-',
    }
  }
  frame = requestAnimationFrame(sample)
}

onMounted(() => {
  frame = requestAnimationFrame(sample)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  configureLight({ falloff: 900, height: 520, gain: 1 })
})

const position = computed(() => `${Math.round(light.x.value)}, ${Math.round(light.y.value)}`)
</script>

<template>
  <section id="inspetor" class="inspector">
    <header class="inspector__header">
      <h2 class="inspector__title">inspetor de luz</h2>
      <p class="inspector__lead">
        Cinco superfícies iguais, cada uma dentro de um contexto diferente. Na 0.1.0 o reflexo era
        posicionado em coordenadas de janela com um fundo fixo, então qualquer ancestral com
        transform, filter ou contain roubava o ponto de referência e o brilho saía do lugar. Agora a
        posição é calculada por elemento, em porcentagem da própria caixa, e as cinco precisam
        concordar. Passe o cursor entre elas.
      </p>
    </header>

    <div class="inspector__controls">
      <RangeControl
        v-model="falloff"
        label="alcance"
        :min="200"
        :max="2400"
        @update:model-value="applyTuning"
      />
      <RangeControl
        v-model="height"
        label="altura"
        :min="60"
        :max="2000"
        @update:model-value="applyTuning"
      />
      <RangeControl
        v-model="gain"
        label="ganho %"
        :min="10"
        :max="300"
        @update:model-value="applyTuning"
      />
    </div>

    <dl class="inspector__readout">
      <div>
        <dt>fonte</dt>
        <dd>{{ position }}</dd>
      </div>
      <div>
        <dt>modo</dt>
        <dd>{{ light.mode.value }}</dd>
      </div>
      <div v-for="(value, key) in readout" :key="key">
        <dt>{{ key }}</dt>
        <dd>{{ value }}</dd>
      </div>
    </dl>

    <div class="inspector__grid">
      <div v-for="item in cases" :key="item.id" class="inspector__case">
        <p class="inspector__caption">{{ item.label }}</p>
        <div class="inspector__wrapper" :class="item.wrapper">
          <GlassSurface
            :ref="item.id === 'plain' ? undefined : undefined"
            class="inspector__panel"
            interactive
          >
            <span class="inspector__panelLabel">{{ item.id }}</span>
          </GlassSurface>
        </div>
      </div>

      <div class="inspector__case">
        <p class="inspector__caption">elemento avulso com a diretiva v-glass</p>
        <div class="inspector__wrapper">
          <div ref="probeRef" v-glass.interactive class="inspector__panel">
            <span class="inspector__panelLabel">v-glass</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inspector {
  scroll-margin-top: 32px;
  margin-bottom: 96px;
}

.inspector__title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--gt-fg);
}

.inspector__lead {
  margin: 0 0 20px;
  max-width: 72ch;
  font-size: 13px;
  line-height: 1.8;
  color: var(--gt-fg-muted);
}

.inspector__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px dashed rgb(var(--gt-line-tint) / 0.1);
  border-radius: 10px;
}

.inspector__readout {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid rgb(var(--gt-line-tint) / 0.06);
  border-radius: 10px;
  font-size: 12px;
}

.inspector__readout div {
  display: flex;
  gap: 8px;
}

.inspector__readout dt {
  color: var(--gt-fg-faint);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 10px;
  align-self: center;
}

.inspector__readout dd {
  margin: 0;
  min-width: 7ch;
  color: var(--gt-gray-8);
}

.inspector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.inspector__caption {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--gt-fg-faint);
}

/* Each wrapper reproduces one property that creates a containing block and
   broke the fixed background. The values are deliberately inert: the side
   effect is the point, not the appearance. */
.is-transformed {
  transform: rotate(0.001deg);
}

.is-filtered {
  filter: blur(0);
}

.is-contained {
  contain: paint;
}

.is-scroller {
  max-height: 120px;
  overflow: auto;
  padding-bottom: 60px;
}

.inspector__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
}

.inspector__panelLabel {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gt-fg-faint);
}
</style>
