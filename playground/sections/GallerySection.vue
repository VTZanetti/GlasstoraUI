<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
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
} from 'glasstora'

const comando = ref('')
const invalido = ref('rm -rf /')
const ligado = ref(true)
const desligado = ref(false)
const modalAberto = ref(false)
const progresso = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    progresso.value = progresso.value >= 100 ? 0 : progresso.value + 1
  }, 90)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const usoLinhas = [
  "import { GlassProvider } from 'glasstora'",
  "import 'glasstora/style.css'",
  '<GlassProvider> seu app aqui </GlassProvider>',
]
</script>

<template>
  <section id="componentes">
    <p class="demo-kicker">02 · componentes</p>
    <h2 class="demo-h2">Os dez componentes da versão 0.1</h2>
    <p class="demo-lead">
      Todos usam a mesma receita <code>.gt-glass</code>, que reúne refração, grain, brilho de borda
      e condensação. Nenhum componente reimplementa esses efeitos.
    </p>

    <div class="gallery">
      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassButton</p>
        <div class="card__row">
          <GlassButton>executar</GlassButton>
          <GlassButton variant="ghost">cancelar</GlassButton>
          <GlassButton loading>compilando</GlassButton>
        </div>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassInput</p>
        <div class="card__col">
          <GlassInput v-model="comando" prompt block-caret placeholder="digite um comando" />
          <GlassInput v-model="invalido" invalid />
        </div>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassSwitch</p>
        <div class="card__col">
          <GlassSwitch v-model="ligado">scanlines</GlassSwitch>
          <GlassSwitch v-model="desligado">modo verboso</GlassSwitch>
        </div>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassKbd</p>
        <p class="card__text">
          pressione <GlassKbd>Ctrl</GlassKbd> + <GlassKbd>K</GlassKbd> para buscar, ou
          <GlassKbd>Esc</GlassKbd> para fechar
        </p>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassBadge</p>
        <div class="card__row">
          <GlassBadge>estável</GlassBadge>
          <GlassBadge variant="outline">beta</GlassBadge>
          <GlassBadge variant="solid" :dot="false">novo</GlassBadge>
          <GlassBadge pulse>gravando</GlassBadge>
        </div>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassProgress</p>
        <div class="card__col">
          <GlassProgress :value="progresso" show-value />
          <GlassProgress :value="progresso" mode="ascii" show-value />
          <GlassProgress indeterminate />
        </div>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassModal</p>
        <GlassButton @click="modalAberto = true">abrir modal</GlassButton>
        <GlassModal v-model="modalAberto" title="confirmar operação">
          <p>
            O painel distorce o conteúdo que estiver atrás dele. O foco fica preso no diálogo e a
            tecla <GlassKbd>Esc</GlassKbd> fecha, assim como um clique fora.
          </p>
          <template #footer>
            <GlassButton variant="ghost" @click="modalAberto = false">cancelar</GlassButton>
            <GlassButton @click="modalAberto = false">confirmar</GlassButton>
          </template>
        </GlassModal>
      </GlassSurface>

      <GlassSurface class="card" :elevation="1">
        <p class="card__label">GlassSurface</p>
        <div class="card__row">
          <GlassSurface class="mini" :elevation="0" radius="sm">e0</GlassSurface>
          <GlassSurface class="mini" :elevation="1" radius="md">e1</GlassSurface>
          <GlassSurface class="mini" :elevation="3" radius="lg">e3</GlassSurface>
        </div>
      </GlassSurface>

      <GlassSurface class="card card--wide" :elevation="1">
        <p class="card__label">GlassTerminal</p>
        <GlassTerminal title="uso" :lines="usoLinhas" prompt="$" />
      </GlassSurface>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.card__label {
  margin: 0 0 14px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b6b6b;
}

.card--wide {
  grid-column: 1 / -1;
}

.card__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.card__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card__text {
  margin: 0;
  color: #9e9e9e;
  line-height: 2;
  font-size: 13px;
}

.mini {
  display: grid;
  place-items: center;
  width: 72px;
  height: 56px;
  padding: 0;
  font-size: 12px;
  color: #9e9e9e;
}
</style>
