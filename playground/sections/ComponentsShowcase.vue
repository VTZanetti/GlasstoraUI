<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  GlassAlert,
  GlassAvatar,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassCheckbox,
  GlassDivider,
  GlassField,
  GlassInput,
  GlassKbd,
  GlassModal,
  GlassPopover,
  GlassProgress,
  GlassSkeleton,
  GlassSpinner,
  GlassSurface,
  GlassSwitch,
  GlassTerminal,
  GlassTextarea,
  GlassTooltip,
  type GlassPlacement,
  type GlassSize,
} from 'glasstora'
import ShowcaseCard from '../components/ShowcaseCard.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import ToggleControl from '../components/ToggleControl.vue'
import RangeControl from '../components/RangeControl.vue'

const SIZES = ['sm', 'md', 'lg']

const props = defineProps<{ grain: boolean; refraction: string; theme: string }>()
const emit = defineEmits<{
  'update:grain': [value: boolean]
  'update:refraction': [value: string]
  'update:theme': [value: string]
}>()

/* The controls work with plain strings. The typed values are derived here so
   each component still receives its own union type. */

/* GlassProvider */
const refractionMode = computed(() => props.refraction as 'auto' | 'on' | 'off')
const providerCode = computed(
  () => `<GlassProvider
  refraction="${props.refraction}"
  theme="${props.theme}"
  :grain="${props.grain}"
>
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

/* GlassCard */
const cardElevationRaw = ref('1')
const cardInteractive = ref(false)
const cardElevation = computed(() => Number(cardElevationRaw.value) as 0 | 1 | 2 | 3)
const cardCode = computed(
  () => `<GlassCard
  title="build"
  :elevation="${cardElevationRaw.value}"${cardInteractive.value ? '\n  interactive' : ''}
>
  saída do último deploy
  <template #footer>
    <GlassButton size="sm" variant="ghost">detalhes</GlassButton>
  </template>
</GlassCard>`,
)

/* GlassDivider */
const dividerLabelled = ref(true)
const dividerCode = computed(() => `<GlassDivider${dividerLabelled.value ? ' label="ou"' : ''} />`)

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

/* GlassField */
const fieldValue = ref('')
const fieldWithError = ref(false)
const fieldRequired = ref(true)
const fieldCode = computed(
  () => `<GlassField
  label="e-mail"
  description="usamos apenas para o login"${
    fieldWithError.value ? `\n  error="informe um endereço válido"` : ''
  }${fieldRequired.value ? '\n  required' : ''}
>
  <GlassInput v-model="email" type="email" />
</GlassField>`,
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

/* GlassTextarea */
const textareaValue = ref('')
const textareaAutosize = ref(true)
const textareaCode = computed(
  () => `<GlassTextarea
  v-model="bio"
  :rows="2"${textareaAutosize.value ? '\n  autosize' : ''}
  placeholder="uma linha sobre você"
/>`,
)

/* GlassCheckbox */
const checkboxOn = ref(true)
const checkboxIndeterminate = ref(false)
const checkboxSizeRaw = ref('md')
const checkboxSize = computed(() => checkboxSizeRaw.value as GlassSize)
const checkboxCode = computed(
  () => `<GlassCheckbox
  v-model="aceito"
  size="${checkboxSizeRaw.value}"${checkboxIndeterminate.value ? '\n  indeterminate' : ''}
>
  aceito os termos
</GlassCheckbox>`,
)

/* GlassSwitch */
const switchSizeRaw = ref('md')
const switchOn = ref(true)
const switchDisabled = ref(false)
const switchSize = computed(() => switchSizeRaw.value as GlassSize)
const switchCode = computed(
  () => `<GlassSwitch v-model="ativo" size="${switchSizeRaw.value}"${
    switchDisabled.value ? ' disabled' : ''
  }>
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

/* GlassAvatar */
const avatarSizeRaw = ref('md')
const avatarSquare = ref(false)
const avatarSize = computed(() => avatarSizeRaw.value as GlassSize)
const avatarCode = computed(
  () => `<GlassAvatar
  name="Vitor Zanetti"
  size="${avatarSizeRaw.value}"${avatarSquare.value ? '\n  square' : ''}
/>`,
)

/* GlassSpinner */
const spinnerSizeRaw = ref('md')
const spinnerSpeed = ref(80)
const spinnerSize = computed(() => spinnerSizeRaw.value as GlassSize)
const spinnerCode = computed(
  () =>
    `<GlassSpinner size="${spinnerSizeRaw.value}" :speed="${spinnerSpeed.value}" label="carregando" />`,
)

/* GlassSkeleton */
const skeletonLines = ref(3)
const skeletonCode = computed(() => `<GlassSkeleton :lines="${skeletonLines.value}" />`)

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

/* GlassAlert */
const alertVariantRaw = ref('info')
const alertClosable = ref(true)
const alertVariant = computed(() => alertVariantRaw.value as 'info' | 'warn' | 'error' | 'success')
const alertCode = computed(
  () => `<GlassAlert
  variant="${alertVariantRaw.value}"
  title="build lenta"${alertClosable.value ? '\n  closable' : ''}
>
  a etapa de tipos levou 42 segundos.
</GlassAlert>`,
)

/* GlassTooltip */
const tooltipPlacementRaw = ref('top')
const tooltipPlacement = computed(() => tooltipPlacementRaw.value as GlassPlacement)
const tooltipCode = computed(
  () => `<GlassTooltip content="copiado" placement="${tooltipPlacementRaw.value}">
  <GlassButton size="sm">copiar</GlassButton>
</GlassTooltip>`,
)

/* GlassPopover */
const popoverPlacementRaw = ref('bottom-start')
const popoverPlacement = computed(() => popoverPlacementRaw.value as GlassPlacement)
const popoverCode = computed(
  () => `<GlassPopover placement="${popoverPlacementRaw.value}">
  <template #label>opções</template>
  <p>o painel se inverte sozinho quando não cabe na janela.</p>
</GlassPopover>`,
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
const terminalRef = ref<{ replay: () => void } | null>(null)
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
      description="Envolve a aplicação, injeta o filtro de refração, escolhe o tema e liga o motor de luz. Estes controles valem para a página inteira, então dá para ver o efeito de cada opção em todos os componentes ao mesmo tempo."
      :code="providerCode"
    >
      <template #controls>
        <SegmentedControl
          label="theme"
          :model-value="theme"
          :options="['dark', 'light', 'auto']"
          @update:model-value="emit('update:theme', $event)"
        />
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
        Refração: <strong>{{ refractionMode }}</strong
        >. Com <code>off</code> o vidro passa a usar apenas blur, que é o mesmo resultado visto no
        Firefox e no Safari. Em <code>theme="light"</code> o brilho branco quase some, e a direção
        da luz passa a ser lida pelo sombreamento da borda oposta. Com <code>auto</code> o provider
        segue a preferência do sistema.
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
      id="card"
      name="GlassCard"
      description="Painel com cabeçalho, corpo e rodapé prontos. É o GlassSurface com uma estrutura montada, e vira um botão inteiro pela propriedade as."
      :code="cardCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="cardElevationRaw"
          label="elevation"
          :options="['0', '1', '2', '3']"
        />
        <ToggleControl v-model="cardInteractive" label="interactive" />
      </template>
      <GlassCard
        class="card-demo"
        title="build"
        :elevation="cardElevation"
        :interactive="cardInteractive"
      >
        <p style="margin: 0">saída do último deploy, concluída em 42 segundos.</p>
        <template #footer>
          <GlassButton size="sm" variant="ghost">detalhes</GlassButton>
        </template>
      </GlassCard>
    </ShowcaseCard>

    <ShowcaseCard
      id="divider"
      name="GlassDivider"
      description="Régua de separação. O rótulo abre um vão no meio da linha, no lugar de flutuar sobre ela."
      :code="dividerCode"
    >
      <template #controls>
        <ToggleControl v-model="dividerLabelled" label="label" />
      </template>
      <div class="divider-demo">
        <GlassDivider :label="dividerLabelled ? 'ou' : ''" />
      </div>
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
    </ShowcaseCard>

    <ShowcaseCard
      id="field"
      name="GlassField"
      description="Rótulo, descrição e erro em volta de um controle. O campo é o dono do id, do aria-describedby e do estado inválido, e o controle dentro dele só lê essa informação."
      :code="fieldCode"
    >
      <template #controls>
        <ToggleControl v-model="fieldWithError" label="error" />
        <ToggleControl v-model="fieldRequired" label="required" />
      </template>
      <GlassField
        class="field-demo"
        label="e-mail"
        description="usamos apenas para o login"
        :error="fieldWithError ? 'informe um endereço válido' : ''"
        :required="fieldRequired"
      >
        <GlassInput v-model="fieldValue" type="email" placeholder="voce@exemplo.com" />
      </GlassField>
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
      id="textarea"
      name="GlassTextarea"
      description="Campo de várias linhas. Com autosize ele cresce junto com o conteúdo em vez de criar barra de rolagem."
      :code="textareaCode"
    >
      <template #controls>
        <ToggleControl v-model="textareaAutosize" label="autosize" />
      </template>
      <GlassTextarea
        v-model="textareaValue"
        class="textarea-demo"
        :rows="2"
        :autosize="textareaAutosize"
        placeholder="uma linha sobre você"
      />
    </ShowcaseCard>

    <ShowcaseCard
      id="checkbox"
      name="GlassCheckbox"
      description="Caixa de seleção com o terceiro estado. Enquanto indeterminate estiver ligado, a marca vira um traço e o aria-checked reporta mixed."
      :code="checkboxCode"
    >
      <template #controls>
        <SegmentedControl v-model="checkboxSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="checkboxIndeterminate" label="indeterminate" />
      </template>
      <GlassCheckbox
        v-model="checkboxOn"
        :size="checkboxSize"
        :indeterminate="checkboxIndeterminate"
      >
        aceito os termos
      </GlassCheckbox>
    </ShowcaseCard>

    <ShowcaseCard
      id="switch"
      name="GlassSwitch"
      description="Interruptor construído sobre um botão nativo com role de switch, então teclado e leitores de tela funcionam sem ajuste extra."
      :code="switchCode"
    >
      <template #controls>
        <SegmentedControl v-model="switchSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="switchDisabled" label="disabled" />
      </template>
      <GlassSwitch v-model="switchOn" :size="switchSize" :disabled="switchDisabled">
        rastrear ponteiro
      </GlassSwitch>
    </ShowcaseCard>

    <ShowcaseCard
      id="kbd"
      name="GlassKbd"
      description="Tecla para documentar atalhos. O tamanho acompanha a fonte do texto em volta."
      :code="kbdCode"
    >
      <p class="kbd-demo">
        pressione <GlassKbd>Ctrl</GlassKbd> + <GlassKbd>K</GlassKbd> para buscar
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
    </ShowcaseCard>

    <ShowcaseCard
      id="avatar"
      name="GlassAvatar"
      description="Retrato com iniciais de reserva quando não há imagem ou quando ela falha. A imagem que houver é dessaturada, porque a biblioteca inteira é monocromática."
      :code="avatarCode"
    >
      <template #controls>
        <SegmentedControl v-model="avatarSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="avatarSquare" label="square" />
      </template>
      <GlassAvatar name="Vitor Zanetti" :size="avatarSize" :square="avatarSquare" />
    </ShowcaseCard>

    <ShowcaseCard
      id="spinner"
      name="GlassSpinner"
      description="Indicador de carregamento em braille. É o mesmo que o GlassButton usa por dentro, e para de girar quando o usuário pede menos movimento."
      :code="spinnerCode"
    >
      <template #controls>
        <SegmentedControl v-model="spinnerSizeRaw" label="size" :options="SIZES" />
        <RangeControl v-model="spinnerSpeed" label="speed" :min="40" :max="200" />
      </template>
      <GlassSpinner :size="spinnerSize" :speed="spinnerSpeed" label="carregando" />
    </ShowcaseCard>

    <ShowcaseCard
      id="skeleton"
      name="GlassSkeleton"
      description="Espaço reservado enquanto o conteúdo carrega. A última linha sai mais curta para ler como parágrafo, e o brilho corre na direção da luz global."
      :code="skeletonCode"
    >
      <template #controls>
        <RangeControl v-model="skeletonLines" label="lines" :min="1" :max="4" />
      </template>
      <div class="skeleton-demo">
        <GlassSkeleton :lines="skeletonLines" />
      </div>
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
      </div>
    </ShowcaseCard>

    <ShowcaseCard
      id="alert"
      name="GlassAlert"
      description="Aviso em quatro pesos. A paleta não tem cor, então a variante se lê pela régua da esquerda e por um glifo, e o error é o único anunciado de forma assertiva."
      :code="alertCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="alertVariantRaw"
          label="variant"
          :options="['info', 'success', 'warn', 'error']"
        />
        <ToggleControl v-model="alertClosable" label="closable" />
      </template>
      <div class="alert-demo">
        <GlassAlert :variant="alertVariant" title="build lenta" :closable="alertClosable">
          a etapa de tipos levou 42 segundos.
        </GlassAlert>
      </div>
    </ShowcaseCard>

    <ShowcaseCard
      id="tooltip"
      name="GlassTooltip"
      description="Dica flutuante posicionada sem dependência externa. Ela se inverte quando não cabe do lado pedido e desliza para não vazar da janela."
      :code="tooltipCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="tooltipPlacementRaw"
          label="placement"
          :options="['top', 'bottom', 'left', 'right']"
        />
      </template>
      <GlassTooltip content="copiado para a área de transferência" :placement="tooltipPlacement">
        <GlassButton size="sm">copiar</GlassButton>
      </GlassTooltip>
    </ShowcaseCard>

    <ShowcaseCard
      id="popover"
      name="GlassPopover"
      description="Painel flutuante ancorado no gatilho. Fecha com Esc e com clique fora, devolve o foco ao fechar e some se o gatilho sair de um contêiner com rolagem."
      :code="popoverCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="popoverPlacementRaw"
          label="placement"
          :options="['bottom-start', 'bottom-end', 'top', 'right']"
        />
      </template>
      <GlassPopover :placement="popoverPlacement">
        <template #label>
          <GlassButton size="sm" variant="ghost">opções</GlassButton>
        </template>
        <p style="margin: 0">O painel se inverte sozinho quando encosta na borda da janela.</p>
      </GlassPopover>
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
        <GlassButton size="sm" variant="ghost" @click="terminalRef?.replay()">repetir</GlassButton>
      </template>
      <GlassTerminal
        ref="terminalRef"
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
  color: var(--gt-fg);
}

.surface-demo__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gt-fg-muted);
}

.card-demo {
  max-width: 300px;
}

.divider-demo {
  width: 100%;
  max-width: 340px;
}

.field-demo {
  width: 100%;
  max-width: 340px;
}

.input-demo {
  min-width: 260px;
}

.textarea-demo {
  width: 100%;
  max-width: 340px;
}

.kbd-demo {
  margin: 0;
  font-size: 13px;
  line-height: 2.2;
  color: var(--gt-fg-muted);
}

.skeleton-demo,
.alert-demo {
  width: 100%;
  max-width: 420px;
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

.note {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--gt-fg-faint);
}
</style>
