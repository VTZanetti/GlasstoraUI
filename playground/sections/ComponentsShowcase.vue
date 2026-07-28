<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  GlassBadge,
  GlassButton,
  GlassInput,
  GlassKbd,
  GlassModal,
  GlassProgress,
  GlassSurface,
  GlassSwitch,
  GlassTerminal,
  type GlassSize,
} from 'glasstora'
import ShowcaseCard from '../components/ShowcaseCard.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import ToggleControl from '../components/ToggleControl.vue'
import RangeControl from '../components/RangeControl.vue'

const SIZES = ['sm', 'md', 'lg']

const props = defineProps<{ grain: boolean; refraction: string }>()
const emit = defineEmits<{
  'update:grain': [value: boolean]
  'update:refraction': [value: string]
}>()

/* The controls work with plain strings. The typed values are derived here so
   each component still receives its own union type. */

/* GlassProvider */
const refractionMode = computed(() => props.refraction as 'auto' | 'on' | 'off')
const providerCode = computed(
  () => `<GlassProvider refraction="${props.refraction}" :grain="${props.grain}">
  <App />
</GlassProvider>`,
)

/* GlassSurface */
const surfaceElevationRaw = ref('1')
const surfaceRadiusRaw = ref('md')
const surfaceInteractive = ref(true)
const surfaceElevation = computed(() => Number(surfaceElevationRaw.value) as 0 | 1 | 2 | 3)
const surfaceRadius = computed(() => surfaceRadiusRaw.value as 'sm' | 'md' | 'lg')
const surfaceCode = computed(
  () => `<GlassSurface
  :elevation="${surfaceElevationRaw.value}"
  radius="${surfaceRadiusRaw.value}"${surfaceInteractive.value ? '\n  interactive' : ''}
>
  Conteúdo do painel
</GlassSurface>`,
)

/* GlassButton */
const buttonVariantRaw = ref('solid')
const buttonSizeRaw = ref('md')
const buttonLoading = ref(false)
const buttonDisabled = ref(false)
const buttonVariant = computed(() => buttonVariantRaw.value as 'solid' | 'ghost')
const buttonSize = computed(() => buttonSizeRaw.value as GlassSize)
const buttonCode = computed(
  () => `<GlassButton
  variant="${buttonVariantRaw.value}"
  size="${buttonSizeRaw.value}"${buttonLoading.value ? '\n  loading' : ''}${
    buttonDisabled.value ? '\n  disabled' : ''
  }
  @click="executar"
>
  executar
</GlassButton>`,
)

/* GlassInput */
const inputValue = ref('git status')
const inputSizeRaw = ref('md')
const inputPrompt = ref(true)
const inputBlockCaret = ref(true)
const inputInvalid = ref(false)
const inputSize = computed(() => inputSizeRaw.value as GlassSize)
const inputCode = computed(
  () => `<GlassInput
  v-model="comando"
  size="${inputSizeRaw.value}"${inputPrompt.value ? '\n  prompt' : ''}${
    inputBlockCaret.value ? '\n  block-caret' : ''
  }${inputInvalid.value ? '\n  invalid' : ''}
  placeholder="digite um comando"
/>`,
)

/* GlassSwitch */
const switchSizeRaw = ref('md')
const switchA = ref(true)
const switchB = ref(false)
const switchSize = computed(() => switchSizeRaw.value as GlassSize)
const switchCode = computed(
  () => `<GlassSwitch v-model="ativo" size="${switchSizeRaw.value}">
  rastrear ponteiro
</GlassSwitch>`,
)

/* GlassKbd */
const kbdCode = `<p>
  pressione <GlassKbd>Ctrl</GlassKbd> + <GlassKbd>K</GlassKbd> para buscar
</p>`

/* GlassBadge */
const badgeVariantRaw = ref('neutral')
const badgeDot = ref(true)
const badgePulse = ref(false)
const badgeVariant = computed(() => badgeVariantRaw.value as 'neutral' | 'outline' | 'solid')
const badgeCode = computed(
  () => `<GlassBadge
  variant="${badgeVariantRaw.value}"${badgeDot.value ? '' : '\n  :dot="false"'}${
    badgePulse.value ? '\n  pulse' : ''
  }
>
  estável
</GlassBadge>`,
)

/* GlassProgress */
const progressValue = ref(64)
const progressModeRaw = ref('ascii')
const progressShowValue = ref(true)
const progressIndeterminate = ref(false)
const progressMode = computed(() => progressModeRaw.value as 'line' | 'ascii')
const progressCode = computed(
  () => `<GlassProgress
  :value="${progressValue.value}"
  mode="${progressModeRaw.value}"${progressShowValue.value ? '\n  show-value' : ''}${
    progressIndeterminate.value ? '\n  indeterminate' : ''
  }
/>`,
)

/* GlassModal */
const modalOpen = ref(false)
const modalCode = `<GlassButton @click="aberto = true">abrir modal</GlassButton>

<GlassModal v-model="aberto" title="confirmar operação" close-label="Fechar">
  <p>O painel distorce o conteúdo que estiver atrás dele.</p>
  <template #footer>
    <GlassButton variant="ghost" @click="aberto = false">cancelar</GlassButton>
    <GlassButton @click="aberto = false">confirmar</GlassButton>
  </template>
</GlassModal>`

/* GlassTerminal */
const terminalRun = ref(0)
const terminalScanlines = ref(true)
const terminalSpeed = ref(26)
const terminalLines = [
  'npm i glasstora',
  'ok   pacote instalado',
  'ok   estilos importados',
  'pronto para usar',
]
const terminalCode = computed(
  () => `<GlassTerminal
  :lines="linhas"
  typewriter
  :speed="${terminalSpeed.value}"${terminalScanlines.value ? '\n  scanlines' : ''}
  @done="aoTerminar"
/>`,
)

/* Self advancing example for the progress bar */
const autoValue = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    autoValue.value = autoValue.value >= 100 ? 0 : autoValue.value + 2
  }, 120)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section id="componentes" class="showcase-section">
    <p class="demo-kicker">03 · componentes</p>
    <h2 class="demo-h2">Explore cada componente</h2>
    <p class="demo-lead">
      Os controles de cada bloco alteram as propriedades em tempo real, e o código logo abaixo
      acompanha a mudança. Use o botão de copiar para levar o exemplo direto para o seu projeto.
    </p>

    <ShowcaseCard
      id="provider"
      name="GlassProvider"
      description="Envolve a aplicação, injeta o filtro de refração e liga o motor de luz. Estes controles valem para a página inteira, então dá para ver o efeito de cada opção em todos os componentes ao mesmo tempo."
      :code="providerCode"
    >
      <template #controls>
        <SegmentedControl
          label="refraction"
          :model-value="refraction"
          :options="['auto', 'on', 'off']"
          @update:model-value="emit('update:refraction', $event)"
        />
        <ToggleControl
          label="grain"
          :model-value="grain"
          @update:model-value="emit('update:grain', $event)"
        />
      </template>
      <p class="note">
        Modo atual: <strong>{{ refractionMode }}</strong
        >. Com <code>off</code> o vidro passa a usar apenas blur, que é o mesmo resultado visto no
        Firefox e no Safari.
      </p>
    </ShowcaseCard>

    <ShowcaseCard
      id="surface"
      name="GlassSurface"
      description="Painel base de vidro. Todos os outros componentes são construídos sobre a mesma receita."
      :code="surfaceCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="surfaceElevationRaw"
          label="elevation"
          :options="['0', '1', '2', '3']"
        />
        <SegmentedControl v-model="surfaceRadiusRaw" label="radius" :options="SIZES" />
        <ToggleControl v-model="surfaceInteractive" label="interactive" />
      </template>
      <GlassSurface
        class="surface-demo"
        :elevation="surfaceElevation"
        :radius="surfaceRadius"
        :interactive="surfaceInteractive"
      >
        <p class="surface-demo__title">painel de vidro</p>
        <p class="surface-demo__text">
          passe o cursor para ver a condensação e o brilho acompanhando a luz
        </p>
      </GlassSurface>
    </ShowcaseCard>

    <ShowcaseCard
      id="button"
      name="GlassButton"
      description="Botão em duas variantes. O estado de carregamento mostra um indicador em braille e bloqueia o clique."
      :code="buttonCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="buttonVariantRaw"
          label="variant"
          :options="['solid', 'ghost']"
        />
        <SegmentedControl v-model="buttonSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="buttonLoading" label="loading" />
        <ToggleControl v-model="buttonDisabled" label="disabled" />
      </template>
      <GlassButton
        :variant="buttonVariant"
        :size="buttonSize"
        :loading="buttonLoading"
        :disabled="buttonDisabled"
      >
        executar
      </GlassButton>
      <span class="divider" />
      <GlassButton variant="ghost" size="sm">sm</GlassButton>
      <GlassButton variant="ghost">md</GlassButton>
      <GlassButton variant="ghost" size="lg">lg</GlassButton>
    </ShowcaseCard>

    <ShowcaseCard
      id="input"
      name="GlassInput"
      description="Campo de texto com duas marcas de terminal: o prefixo de prompt e o cursor em bloco, que acompanha a posição real do caret porque a fonte é monoespaçada."
      :code="inputCode"
    >
      <template #controls>
        <SegmentedControl v-model="inputSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="inputPrompt" label="prompt" />
        <ToggleControl v-model="inputBlockCaret" label="block caret" />
        <ToggleControl v-model="inputInvalid" label="invalid" />
      </template>
      <GlassInput
        v-model="inputValue"
        class="input-demo"
        :size="inputSize"
        :prompt="inputPrompt"
        :block-caret="inputBlockCaret"
        :invalid="inputInvalid"
        placeholder="digite um comando"
      />
      <span class="note">clique no campo e use as setas para ver o cursor se mover</span>
    </ShowcaseCard>

    <ShowcaseCard
      id="switch"
      name="GlassSwitch"
      description="Interruptor construído sobre um botão nativo com role de switch, então teclado e leitores de tela funcionam sem ajuste extra."
      :code="switchCode"
    >
      <template #controls>
        <SegmentedControl v-model="switchSizeRaw" label="size" :options="SIZES" />
      </template>
      <GlassSwitch v-model="switchA" :size="switchSize">rastrear ponteiro</GlassSwitch>
      <GlassSwitch v-model="switchB" :size="switchSize">modo verboso</GlassSwitch>
      <GlassSwitch :model-value="false" disabled>desativado</GlassSwitch>
    </ShowcaseCard>

    <ShowcaseCard
      id="kbd"
      name="GlassKbd"
      description="Tecla para documentar atalhos. O tamanho acompanha a fonte do texto em volta."
      :code="kbdCode"
    >
      <p class="kbd-demo">
        pressione <GlassKbd>Ctrl</GlassKbd> + <GlassKbd>K</GlassKbd> para buscar,
        <GlassKbd>Esc</GlassKbd> para fechar e <GlassKbd>Shift</GlassKbd> +
        <GlassKbd>Tab</GlassKbd> para voltar
      </p>
    </ShowcaseCard>

    <ShowcaseCard
      id="badge"
      name="GlassBadge"
      description="Etiqueta de status em três pesos visuais. O ponto pode pulsar para indicar atividade em andamento."
      :code="badgeCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="badgeVariantRaw"
          label="variant"
          :options="['neutral', 'outline', 'solid']"
        />
        <ToggleControl v-model="badgeDot" label="dot" />
        <ToggleControl v-model="badgePulse" label="pulse" />
      </template>
      <GlassBadge :variant="badgeVariant" :dot="badgeDot" :pulse="badgePulse">estável</GlassBadge>
      <span class="divider" />
      <GlassBadge>neutral</GlassBadge>
      <GlassBadge variant="outline">outline</GlassBadge>
      <GlassBadge variant="solid" :dot="false">solid</GlassBadge>
      <GlassBadge pulse>gravando</GlassBadge>
    </ShowcaseCard>

    <ShowcaseCard
      id="progress"
      name="GlassProgress"
      description="Barra de progresso em dois modos. O modo ascii desenha blocos de texto, no mesmo espírito das barras de instalação de pacotes."
      :code="progressCode"
    >
      <template #controls>
        <SegmentedControl v-model="progressModeRaw" label="mode" :options="['line', 'ascii']" />
        <RangeControl v-model="progressValue" label="value" />
        <ToggleControl v-model="progressShowValue" label="show value" />
        <ToggleControl v-model="progressIndeterminate" label="indeterminate" />
      </template>
      <div class="progress-demo">
        <GlassProgress
          :value="progressValue"
          :mode="progressMode"
          :show-value="progressShowValue"
          :indeterminate="progressIndeterminate"
        />
        <GlassProgress :value="autoValue" mode="ascii" show-value />
        <GlassProgress :value="autoValue" show-value />
      </div>
    </ShowcaseCard>

    <ShowcaseCard
      id="modal"
      name="GlassModal"
      description="Diálogo teleportado para o body. Ao abrir, prende o foco, bloqueia a rolagem e devolve o foco ao elemento anterior quando fecha. É onde a refração fica mais evidente, porque há bastante conteúdo atrás do painel."
      :code="modalCode"
    >
      <GlassButton @click="modalOpen = true">abrir modal</GlassButton>
      <GlassModal v-model="modalOpen" title="confirmar operação" close-label="Fechar">
        <p>
          Repare no conteúdo atrás deste painel. Em navegadores Chromium o texto e a grade de pontos
          aparecem distorcidos pelo filtro de refração.
        </p>
        <p>
          A tecla <GlassKbd>Esc</GlassKbd> fecha, assim como um clique fora do painel, e o foco não
          escapa do diálogo enquanto ele estiver aberto.
        </p>
        <template #footer>
          <GlassButton variant="ghost" @click="modalOpen = false">cancelar</GlassButton>
          <GlassButton @click="modalOpen = false">confirmar</GlassButton>
        </template>
      </GlassModal>
    </ShowcaseCard>

    <ShowcaseCard
      id="terminal"
      name="GlassTerminal"
      description="Janela de terminal com efeito de digitação. O texto completo fica disponível para leitores de tela, e com a preferência por menos movimento ele aparece de uma vez."
      :code="terminalCode"
    >
      <template #controls>
        <RangeControl v-model="terminalSpeed" label="speed" :min="8" :max="90" />
        <ToggleControl v-model="terminalScanlines" label="scanlines" />
        <GlassButton size="sm" variant="ghost" @click="terminalRun++">repetir</GlassButton>
      </template>
      <GlassTerminal
        :key="terminalRun"
        class="terminal-demo"
        :lines="terminalLines"
        :speed="terminalSpeed"
        :scanlines="terminalScanlines"
        typewriter
      />
    </ShowcaseCard>
  </section>
</template>

<style scoped>
.showcase-section {
  padding-top: 120px;
}

.surface-demo {
  max-width: 340px;
}

.surface-demo__title {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #f5f5f5;
}

.surface-demo__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #9e9e9e;
}

.input-demo {
  min-width: 260px;
}

.kbd-demo {
  margin: 0;
  font-size: 13px;
  line-height: 2.2;
  color: #9e9e9e;
}

.progress-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 420px;
}

.terminal-demo {
  width: 100%;
  max-width: 460px;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgb(255 255 255 / 0.12);
}

.note {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #6b6b6b;
}
</style>
