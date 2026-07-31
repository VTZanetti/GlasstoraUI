<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  GlassAccordion,
  GlassAlert,
  GlassAvatar,
  GlassBadge,
  GlassBreadcrumb,
  GlassButton,
  GlassCard,
  GlassCheckbox,
  GlassCombobox,
  GlassCommandPalette,
  GlassDivider,
  GlassDrawer,
  GlassField,
  GlassInput,
  GlassKbd,
  GlassMenu,
  GlassModal,
  GlassPagination,
  GlassPopover,
  GlassProgress,
  GlassRadio,
  GlassRadioGroup,
  GlassSelect,
  GlassSkeleton,
  GlassSlider,
  GlassSpinner,
  GlassSurface,
  GlassSwitch,
  GlassTable,
  GlassTabPanel,
  GlassTabs,
  GlassTerminal,
  GlassTextarea,
  GlassToast,
  GlassTooltip,
  useToast,
  type GlassAccordionItem,
  type GlassBreadcrumbItem,
  type GlassCommand,
  type GlassDrawerSide,
  type GlassMenuEntry,
  type GlassPlacement,
  type GlassSelectOption,
  type GlassSize,
  type GlassTabItem,
  type GlassTableColumn,
  type GlassToastPosition,
  type GlassToastVariant,
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

/* GlassRadioGroup */
const radioValue = ref<string | number>('auto')
const radioOrientationRaw = ref('vertical')
const radioSizeRaw = ref('md')
const radioDisabled = ref(false)
const radioOrientation = computed(() => radioOrientationRaw.value as 'horizontal' | 'vertical')
const radioSize = computed(() => radioSizeRaw.value as GlassSize)
const radioCode = computed(
  () => `<GlassRadioGroup
  v-model="refracao"
  name="refracao"
  orientation="${radioOrientationRaw.value}"
  size="${radioSizeRaw.value}"${radioDisabled.value ? '\n  disabled' : ''}
>
  <GlassRadio value="auto">detectar</GlassRadio>
  <GlassRadio value="on">sempre ligada</GlassRadio>
  <GlassRadio value="off">nunca</GlassRadio>
</GlassRadioGroup>`,
)

/* GlassSlider */
const sliderValue = ref(60)
const sliderStepRaw = ref('1')
const sliderShowValue = ref(true)
const sliderDisabled = ref(false)
const sliderStep = computed(() => Number(sliderStepRaw.value))
const formatPercent = (value: number) => `${value}%`
const sliderCode = computed(
  () => `<GlassSlider
  v-model="opacidade"
  :step="${sliderStepRaw.value}"${sliderShowValue.value ? '\n  show-value' : ''}${
    sliderDisabled.value ? '\n  disabled' : ''
  }
  :format-value="(valor) => valor + '%'"
  label="opacidade do vidro"
/>`,
)

/* GlassSelect */
const selectValue = ref<string | number | null>('md')
const selectPlacementRaw = ref('bottom-start')
const selectSizeRaw = ref('md')
const selectDisabled = ref(false)
const selectPlacement = computed(() => selectPlacementRaw.value as GlassPlacement)
const selectSize = computed(() => selectSizeRaw.value as GlassSize)
const selectOptions: GlassSelectOption[] = [
  { label: 'compacta', value: 'sm' },
  { label: 'padrão', value: 'md' },
  { label: 'confortável', value: 'lg' },
  { label: 'automática', value: 'auto', disabled: true },
]
const selectCode = computed(
  () => `<GlassSelect
  v-model="densidade"
  :options="opcoes"
  placement="${selectPlacementRaw.value}"
  size="${selectSizeRaw.value}"${selectDisabled.value ? '\n  disabled' : ''}
  label="densidade"
  placeholder="escolha a densidade"
/>`,
)

/* GlassCombobox */
const comboValue = ref<string | number | null>(null)
const comboAllowCustom = ref(false)
const comboSizeRaw = ref('md')
const comboSize = computed(() => comboSizeRaw.value as GlassSize)
const comboOptions: GlassSelectOption[] = [
  { label: 'ação', value: 'acao' },
  { label: 'compilação', value: 'compilacao' },
  { label: 'inspeção', value: 'inspecao' },
  { label: 'refração', value: 'refracao' },
  { label: 'transição', value: 'transicao' },
]
const comboCode = computed(
  () => `<GlassCombobox
  v-model="etapa"
  :options="opcoes"
  size="${comboSizeRaw.value}"${comboAllowCustom.value ? '\n  allow-custom-value' : ''}
  label="etapa"
  placeholder="filtre por nome"
  no-results-label="nada encontrado"
/>`,
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
const spinnerSpeed = ref(12)
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
const progressLoop = ref(false)
const progressMode = computed(() => progressModeRaw.value as 'line' | 'ascii' | 'blocks' | 'dots')

// Runs the value from zero to full and starts over, so the fill can be watched
// moving instead of being dragged by hand. Indeterminate ignores the value
// entirely, so the two have nothing to say to each other: whichever is switched
// on turns the other off.
let progressTimer: ReturnType<typeof setInterval> | undefined
watch(progressLoop, (looping) => {
  clearInterval(progressTimer)
  if (!looping) return
  progressIndeterminate.value = false
  progressValue.value = 0
  progressTimer = setInterval(() => {
    progressValue.value = progressValue.value >= 100 ? 0 : progressValue.value + 2
  }, 60)
})
watch(progressIndeterminate, (on) => {
  if (on) progressLoop.value = false
})
onBeforeUnmount(() => clearInterval(progressTimer))
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

/* GlassTabs */
const tabsValue = ref('luz')
const tabsActivationRaw = ref('automatic')
const tabsSizeRaw = ref('md')
const tabsActivation = computed(() => tabsActivationRaw.value as 'automatic' | 'manual')
const tabsSize = computed(() => tabsSizeRaw.value as GlassSize)
const tabItems: GlassTabItem[] = [
  { label: 'luz', value: 'luz' },
  { label: 'refração', value: 'refracao' },
  { label: 'grão', value: 'grao' },
]
const tabsCode = computed(
  () => `<GlassTabs
  v-model="aba"
  :tabs="abas"
  activation="${tabsActivationRaw.value}"
  size="${tabsSizeRaw.value}"
  label="motor de vidro"
>
  <GlassTabPanel value="luz">uma fonte de luz para a página inteira.</GlassTabPanel>
  <GlassTabPanel value="refracao">o filtro que entorta o fundo.</GlassTabPanel>
  <GlassTabPanel value="grao">o ruído que quebra o degradê.</GlassTabPanel>
</GlassTabs>`,
)

/* GlassAccordion */
const accordionValue = ref<string | string[]>('registro')
const accordionMultiple = ref(false)
const accordionItems: GlassAccordionItem[] = [
  { value: 'registro', title: 'registro de superfícies' },
  { value: 'ticker', title: 'laço de animação' },
  { value: 'filtro', title: 'filtro de refração' },
]
const accordionCode = computed(
  () => `<GlassAccordion
  v-model="aberto"
  :items="secoes"${accordionMultiple.value ? '\n  multiple' : ''}
>
  <template #registro>cada superfície entra numa lista única.</template>
  <template #ticker>um laço só recalcula todas elas.</template>
  <template #filtro>um filtro SVG por página, reaproveitado.</template>
</GlassAccordion>`,
)

/* GlassBreadcrumb */
const breadcrumbMaxItems = ref(0)
const breadcrumbSeparatorRaw = ref('/')
const breadcrumbItems: GlassBreadcrumbItem[] = [
  { label: 'glasstora', href: '#componentes' },
  { label: 'componentes', href: '#componentes' },
  { label: 'navegação', href: '#breadcrumb' },
  { label: 'trilha', href: '#breadcrumb' },
  { label: 'GlassBreadcrumb' },
]
const breadcrumbCode = computed(
  () => `<GlassBreadcrumb
  :items="trilha"
  :max-items="${breadcrumbMaxItems.value}"
  separator="${breadcrumbSeparatorRaw.value}"
  expand-label="mostrar todas as páginas"
/>`,
)

/* GlassPagination */
const paginationPage = ref(7)
const paginationCount = ref(20)
const paginationSiblings = ref(1)
const paginationBoundary = ref(1)
const paginationCode = computed(
  () => `<GlassPagination
  v-model="pagina"
  :page-count="${paginationCount.value}"
  :sibling-count="${paginationSiblings.value}"
  :boundary-count="${paginationBoundary.value}"
  previous-label="página anterior"
  next-label="próxima página"
/>`,
)

/* GlassTable */
const tableSticky = ref(true)
const tableEmpty = ref(false)
const tableSizeRaw = ref('md')
const tableSize = computed(() => tableSizeRaw.value as GlassSize)
const tableColumns: GlassTableColumn[] = [
  { key: 'etapa', label: 'etapa', sortable: true },
  { key: 'ms', label: 'ms', sortable: true, align: 'end', width: '6rem' },
  { key: 'estado', label: 'estado', align: 'end' },
]
const tableRows: Record<string, unknown>[] = [
  { etapa: 'tipos', ms: 4210, estado: 'ok' },
  { etapa: 'testes', ms: 1870, estado: 'ok' },
  { etapa: 'pacote', ms: 940, estado: 'ok' },
  { etapa: 'estilos', ms: 320, estado: 'ok' },
  { etapa: 'declarações', ms: 210, estado: 'ok' },
]
const tableCode = computed(
  () => `<GlassTable
  :columns="colunas"
  :rows="linhas"
  row-key="etapa"
  size="${tableSizeRaw.value}"
  max-height="170px"${tableSticky.value ? '\n  sticky-header' : ''}
  empty-label="nenhuma etapa registrada"
/>`,
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

/* GlassMenu */
const menuPlacementRaw = ref('bottom-start')
const menuChoice = ref('nenhum')
const menuPlacement = computed(() => menuPlacementRaw.value as GlassPlacement)
const menuItems: GlassMenuEntry[] = [
  { label: 'duplicar', value: 'duplicar' },
  { label: 'renomear', value: 'renomear' },
  { separator: true },
  { label: 'arquivar', value: 'arquivar', disabled: true },
  { label: 'excluir', value: 'excluir', danger: true },
]
const menuCode = computed(
  () => `<GlassMenu :items="itens" placement="${menuPlacementRaw.value}" @select="aplicar">
  <template #trigger="{ toggle, attrs }">
    <GlassButton size="sm" variant="ghost" v-bind="attrs" @click="toggle">ações</GlassButton>
  </template>
</GlassMenu>`,
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

/* GlassDrawer */
const drawerOpen = ref(false)
const drawerSideRaw = ref('right')
const drawerSide = computed(() => drawerSideRaw.value as GlassDrawerSide)
const drawerCode = computed(
  () => `<GlassButton @click="aberto = true">abrir painel</GlassButton>

<GlassDrawer
  v-model="aberto"
  side="${drawerSideRaw.value}"
  size="22rem"
  title="filtros da build"
  close-label="Fechar"
>
  <p>O painel encosta na borda e prende o foco enquanto estiver aberto.</p>
  <template #footer>
    <GlassButton variant="ghost" @click="aberto = false">limpar</GlassButton>
    <GlassButton @click="aberto = false">aplicar</GlassButton>
  </template>
</GlassDrawer>`,
)

/* GlassToast */
const toast = useToast()
const toastPositionRaw = ref('bottom-right')
const toastVariantRaw = ref('success')
const toastPosition = computed(() => toastPositionRaw.value as GlassToastPosition)
const toastVariant = computed(() => toastVariantRaw.value as GlassToastVariant)

/** One line per variant, so the raised toast matches the tone being shown. */
const TOAST_TEXTS: Record<GlassToastVariant, { title: string; message: string }> = {
  info: { title: 'build na fila', message: 'começa assim que houver runner livre.' },
  success: { title: 'publicado', message: 'a versão foi enviada para o registro.' },
  warn: { title: 'build lenta', message: 'a etapa de tipos levou 42 segundos.' },
  error: { title: 'deploy falhou', message: 'a etapa de estilos saiu com código 1.' },
}

function raiseToast() {
  toast.show({ ...TOAST_TEXTS[toastVariant.value], variant: toastVariant.value })
}

const toastCode = computed(
  () => `<!-- uma vez só, perto da raiz da aplicação -->
<GlassToast position="${toastPositionRaw.value}" :max="3" close-label="Dispensar" />

<!-- e de qualquer lugar, inclusive fora de um componente -->
import { useToast } from 'glasstora'

const { show } = useToast()
show({
  title: 'publicado',
  message: 'a versão foi para o registro.',
  variant: '${toastVariantRaw.value}',
})`,
)

/* GlassCommandPalette */
const paletteOpen = ref(false)
const paletteChoice = ref('nenhum')
const paletteCommands: GlassCommand[] = [
  {
    id: 'tema',
    label: 'alternar o tema',
    keywords: ['claro', 'escuro'],
    shortcut: 'mod+j',
    group: 'aparência',
  },
  { id: 'refracao', label: 'ligar a refração', keywords: ['vidro', 'filtro'], group: 'aparência' },
  { id: 'grao', label: 'desligar o grão', keywords: ['ruído', 'textura'], group: 'aparência' },
  { id: 'docs', label: 'abrir a documentação', shortcut: 'mod+d', group: 'ir para' },
  { id: 'repo', label: 'abrir o repositório', group: 'ir para' },
  { id: 'reset', label: 'restaurar os padrões', disabled: true, group: 'ir para' },
]
const paletteCode = `<GlassCommandPalette
  v-model="aberta"
  :commands="comandos"
  hotkey="mod+k"
  placeholder="digite um comando…"
  no-results-label="nenhum comando"
  @select="executar"
/>`

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
      id="radio-group"
      name="GlassRadioGroup"
      description="Grupo de escolha única. O grupo é dono do valor e do nome, e cada rádio só sabe quanto vale, então é o grupo que um GlassField em volta descreve. Há uma parada de tabulação só, na opção marcada, e as setas movem e selecionam ao mesmo tempo."
      :code="radioCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="radioOrientationRaw"
          label="orientation"
          :options="['vertical', 'horizontal']"
        />
        <SegmentedControl v-model="radioSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="radioDisabled" label="disabled" />
      </template>
      <GlassRadioGroup
        v-model="radioValue"
        name="refracao"
        :orientation="radioOrientation"
        :size="radioSize"
        :disabled="radioDisabled"
      >
        <GlassRadio value="auto">detectar</GlassRadio>
        <GlassRadio value="on">sempre ligada</GlassRadio>
        <GlassRadio value="off">nunca</GlassRadio>
      </GlassRadioGroup>
    </ShowcaseCard>

    <ShowcaseCard
      id="slider"
      name="GlassSlider"
      description="Controle deslizante com teclado completo: setas andam um passo, PageUp e PageDown andam dez, Home e End vão aos limites. O valor é arredondado às casas decimais do próprio passo, então um passo de 0.1 não devolve 0.30000000000000004."
      :code="sliderCode"
    >
      <template #controls>
        <SegmentedControl v-model="sliderStepRaw" label="step" :options="['0.1', '1', '10']" />
        <ToggleControl v-model="sliderShowValue" label="show value" />
        <ToggleControl v-model="sliderDisabled" label="disabled" />
      </template>
      <div class="slider-demo">
        <GlassSlider
          v-model="sliderValue"
          :step="sliderStep"
          :show-value="sliderShowValue"
          :disabled="sliderDisabled"
          :format-value="formatPercent"
          label="opacidade do vidro"
        />
      </div>
    </ShowcaseCard>

    <ShowcaseCard
      id="select"
      name="GlassSelect"
      description="Lista suspensa teleportada para o body. O foco fica no gatilho e a opção ativa é apontada por aria-activedescendant, o que permite usar o select dentro de um diálogo sem tirar o foco dele. Digitar salta para a opção correspondente."
      :code="selectCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="selectPlacementRaw"
          label="placement"
          :options="['bottom-start', 'bottom-end', 'top-start']"
        />
        <SegmentedControl v-model="selectSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="selectDisabled" label="disabled" />
      </template>
      <GlassSelect
        v-model="selectValue"
        class="select-demo"
        :options="selectOptions"
        :placement="selectPlacement"
        :size="selectSize"
        :disabled="selectDisabled"
        label="densidade"
        placeholder="escolha a densidade"
      />
    </ShowcaseCard>

    <ShowcaseCard
      id="combobox"
      name="GlassCombobox"
      description="O mesmo painel do GlassSelect, com o gatilho trocado por um campo que filtra a lista. A busca ignora maiúsculas e acentos, então digitar acao encontra ação, e allow custom value deixa o texto digitado valer como valor."
      :code="comboCode"
    >
      <template #controls>
        <SegmentedControl v-model="comboSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="comboAllowCustom" label="allow custom value" />
      </template>
      <GlassCombobox
        v-model="comboValue"
        class="select-demo"
        :options="comboOptions"
        :size="comboSize"
        :allow-custom-value="comboAllowCustom"
        label="etapa"
        placeholder="filtre por nome"
        no-results-label="nada encontrado"
      />
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
        <RangeControl v-model="spinnerSpeed" label="speed (fps)" :min="2" :max="30" />
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
      description="Barra de progresso em quatro modos. O ascii desenha blocos de texto, no espírito das barras de instalação de pacotes; blocks e dots são a mesma leitura célula a célula, desenhada em vez de escrita. Ligue o loop para ver o preenchimento em movimento."
      :code="progressCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="progressModeRaw"
          label="mode"
          :options="['line', 'ascii', 'blocks', 'dots']"
        />
        <RangeControl
          v-model="progressValue"
          label="value"
          :disabled="progressLoop || progressIndeterminate"
        />
        <ToggleControl v-model="progressLoop" label="loop" :disabled="progressIndeterminate" />
        <ToggleControl v-model="progressShowValue" label="show value" />
        <ToggleControl
          v-model="progressIndeterminate"
          label="indeterminate"
          :disabled="progressLoop"
        />
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
      id="tabs"
      name="GlassTabs"
      description="Abas com o painel do lado. Os ids dos dois lados saem do mesmo valor, então a aba e o painel se encontram sem registro entre eles. Use activation manual quando o painel for caro de montar: aí as setas só movem o foco e a troca espera Enter ou espaço."
      :code="tabsCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="tabsActivationRaw"
          label="activation"
          :options="['automatic', 'manual']"
        />
        <SegmentedControl v-model="tabsSizeRaw" label="size" :options="SIZES" />
      </template>
      <GlassTabs
        v-model="tabsValue"
        class="tabs-demo"
        :tabs="tabItems"
        :activation="tabsActivation"
        :size="tabsSize"
        label="motor de vidro"
      >
        <GlassTabPanel value="luz">
          Uma fonte de luz só para a página inteira, e cada superfície calcula o próprio reflexo a
          partir dela.
        </GlassTabPanel>
        <GlassTabPanel value="refracao">
          O filtro entorta o que está atrás do painel. Onde ele não existe, sobra o desfoque.
        </GlassTabPanel>
        <GlassTabPanel value="grao">
          Um ruído fraco por cima do vidro, que quebra as faixas do degradê.
        </GlassTabPanel>
      </GlassTabs>
    </ShowcaseCard>

    <ShowcaseCard
      id="accordion"
      name="GlassAccordion"
      description="Seções que abrem e fecham. A altura anima por grid-template-rows, sem medir nada em JavaScript, e o conteúdo de cada seção entra por um slot com o nome do próprio valor."
      :code="accordionCode"
    >
      <template #controls>
        <ToggleControl v-model="accordionMultiple" label="multiple" />
      </template>
      <GlassAccordion
        v-model="accordionValue"
        class="accordion-demo"
        :items="accordionItems"
        :multiple="accordionMultiple"
      >
        <template #registro>
          Cada superfície montada entra numa lista única, e sai dela ao ser desmontada.
        </template>
        <template #ticker>
          Um laço só percorre a lista por quadro, em vez de um laço por componente.
        </template>
        <template #filtro>
          Um filtro SVG por página, reaproveitado por todos os painéis que o usam.
        </template>
      </GlassAccordion>
    </ShowcaseCard>

    <ShowcaseCard
      id="breadcrumb"
      name="GlassBreadcrumb"
      description="Trilha de navegação que colapsa o meio por contagem, não por medição: decidir pela largura exigiria renderizar duas vezes, e a resposta mudaria com o contêiner. O último item nunca some, e o botão de reticências abre a trilha inteira."
      :code="breadcrumbCode"
    >
      <template #controls>
        <RangeControl v-model="breadcrumbMaxItems" label="max items" :min="0" :max="5" />
        <SegmentedControl
          v-model="breadcrumbSeparatorRaw"
          label="separator"
          :options="['/', '·', '>']"
        />
      </template>
      <GlassBreadcrumb
        :items="breadcrumbItems"
        :max-items="breadcrumbMaxItems"
        :separator="breadcrumbSeparatorRaw"
        expand-label="mostrar todas as páginas"
      />
    </ShowcaseCard>

    <ShowcaseCard
      id="pagination"
      name="GlassPagination"
      description="Janela de páginas em volta da atual. As reticências são um span inerte, e nunca aparecem no lugar de uma única página: onde o salto cobriria só um número, o número é mostrado."
      :code="paginationCode"
    >
      <template #controls>
        <RangeControl v-model="paginationCount" label="page count" :min="1" :max="30" />
        <RangeControl v-model="paginationSiblings" label="sibling count" :min="0" :max="3" />
        <RangeControl v-model="paginationBoundary" label="boundary count" :min="0" :max="3" />
      </template>
      <GlassPagination
        v-model="paginationPage"
        :page-count="paginationCount"
        :sibling-count="paginationSiblings"
        :boundary-count="paginationBoundary"
        previous-label="página anterior"
        next-label="próxima página"
      />
    </ShowcaseCard>

    <ShowcaseCard
      id="table"
      name="GlassTable"
      description="Tabela com ordenação, cabeçalho fixo e estado vazio. Sem a propriedade sort ela ordena sozinha; passando sort, a ordem das linhas passa a ser sua. A rolagem fica num contêiner interno, porque o anel especular do vidro sai um pixel da caixa e seria recortado por ela."
      :code="tableCode"
    >
      <template #controls>
        <SegmentedControl v-model="tableSizeRaw" label="size" :options="SIZES" />
        <ToggleControl v-model="tableSticky" label="sticky header" />
        <ToggleControl v-model="tableEmpty" label="sem linhas" />
      </template>
      <GlassTable
        class="table-demo"
        :columns="tableColumns"
        :rows="tableEmpty ? [] : tableRows"
        :size="tableSize"
        :sticky-header="tableSticky"
        row-key="etapa"
        max-height="170px"
        label="tempo de cada etapa da build"
        empty-label="nenhuma etapa registrada"
      />
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
      id="menu"
      name="GlassMenu"
      description="Menu suspenso a partir de um gatilho seu. Diferente do popover, aqui o foco entra no painel, que é o que se espera de um menu: seta para baixo abre e vai ao primeiro item, escolher algo ou apertar Esc fecha e devolve o foco ao gatilho."
      :code="menuCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="menuPlacementRaw"
          label="placement"
          :options="['bottom-start', 'bottom-end', 'top-start', 'right-start']"
        />
      </template>
      <GlassMenu :items="menuItems" :placement="menuPlacement" @select="menuChoice = $event.label">
        <template #trigger="{ toggle, attrs }">
          <GlassButton size="sm" variant="ghost" v-bind="attrs" @click="toggle">ações</GlassButton>
        </template>
      </GlassMenu>
      <span class="note">
        último item escolhido: <strong>{{ menuChoice }}</strong>
      </span>
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
      id="drawer"
      name="GlassDrawer"
      description="Irmão do GlassModal, encostado numa das quatro bordas. Os dois ficam na mesma camada e empilham por ordem de montagem, então o Esc pertence sempre ao que abriu por último, e a trava de rolagem conta quem a segura em vez de soltá-la no primeiro fechamento."
      :code="drawerCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="drawerSideRaw"
          label="side"
          :options="['right', 'left', 'top', 'bottom']"
        />
      </template>
      <GlassButton @click="drawerOpen = true">abrir painel</GlassButton>
      <GlassDrawer
        v-model="drawerOpen"
        :side="drawerSide"
        size="22rem"
        title="filtros da build"
        close-label="Fechar"
      >
        <p>
          O painel entra pela borda escolhida e prende o foco enquanto estiver aberto. Enquanto isso
          a página atrás continua onde estava, sem saltar quando a barra de rolagem some.
        </p>
        <p>A tecla <GlassKbd>Esc</GlassKbd> fecha, assim como um clique no fundo escurecido.</p>
        <template #footer>
          <GlassButton variant="ghost" @click="drawerOpen = false">limpar</GlassButton>
          <GlassButton @click="drawerOpen = false">aplicar</GlassButton>
        </template>
      </GlassDrawer>
    </ShowcaseCard>

    <ShowcaseCard
      id="toast"
      name="GlassToast"
      description="A fila vive em escopo de módulo, como o motor de luz, então um aviso pode partir de uma action, de um interceptador ou de qualquer função solta, sem provider e sem estar dentro de um componente. O que se monta na página é só o ponto de saída, uma vez. Passar o ponteiro sobre a pilha pausa a contagem de todos e guarda quanto faltava para cada um."
      :code="toastCode"
    >
      <template #controls>
        <SegmentedControl
          v-model="toastPositionRaw"
          label="position"
          :options="['bottom-right', 'bottom-center', 'top-right', 'top-center']"
        />
        <SegmentedControl
          v-model="toastVariantRaw"
          label="variant"
          :options="['info', 'success', 'warn', 'error']"
        />
      </template>
      <GlassButton @click="raiseToast">notificar</GlassButton>
      <GlassButton variant="ghost" @click="toast.clear()">limpar a fila</GlassButton>
      <GlassToast :position="toastPosition" :max="3" close-label="Dispensar" />
    </ShowcaseCard>

    <ShowcaseCard
      id="command-palette"
      name="GlassCommandPalette"
      description="Busca sobre uma lista de ações. Por dentro é um GlassModal, então herda o aprisionamento de foco, a trava de rolagem e o vidro do painel. A busca ignora maiúsculas e acentos, e olha as palavras-chave além do rótulo, então refracao encontra ligar a refração e vidro também."
      :code="paletteCode"
    >
      <GlassButton @click="paletteOpen = true">abrir a paleta</GlassButton>
      <GlassCommandPalette
        v-model="paletteOpen"
        :commands="paletteCommands"
        placeholder="digite um comando…"
        no-results-label="nenhum comando"
        label="Paleta de comandos"
        @select="paletteChoice = $event.label"
      />
      <span class="note">
        <GlassKbd>Ctrl</GlassKbd> + <GlassKbd>K</GlassKbd> abre a paleta de qualquer ponto da
        página. Último comando escolhido: <strong>{{ paletteChoice }}</strong>
      </span>
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

.slider-demo {
  width: 100%;
  max-width: 340px;
}

.select-demo {
  min-width: 220px;
}

.kbd-demo {
  margin: 0;
  font-size: 13px;
  line-height: 2.2;
  color: var(--gt-fg-muted);
}

.tabs-demo,
.accordion-demo,
.table-demo {
  width: 100%;
  max-width: 440px;
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
