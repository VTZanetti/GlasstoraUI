<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const installCode = 'npm install glasstora'

const setupCode = `// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import 'glasstora/style.css'

createApp(App).mount('#app')`

// Built by concatenation because a literal closing script tag would end this
// block early, and escaping it inside the string is flagged by the linter.
const scriptOpen = '<' + 'script setup>'
const scriptClose = '<' + '/script>'

const usageCode = `${scriptOpen}
import { GlassProvider, GlassButton } from 'glasstora'
${scriptClose}

<template>
  <GlassProvider>
    <GlassButton>executar</GlassButton>
  </GlassProvider>
</template>`
</script>

<template>
  <section id="instalacao">
    <p class="demo-kicker">01 · instalação</p>
    <h2 class="demo-h2">Três passos para começar</h2>
    <p class="demo-lead">
      A biblioteca não traz dependências de runtime. O Vue 3 entra apenas como peer dependency, e os
      estilos ficam em um único arquivo importado uma vez.
    </p>

    <ol class="steps">
      <li class="steps__item">
        <p class="steps__label">Instale o pacote</p>
        <CodeBlock :code="installCode" />
      </li>
      <li class="steps__item">
        <p class="steps__label">Importe a folha de estilo no ponto de entrada</p>
        <CodeBlock :code="setupCode" />
      </li>
      <li class="steps__item">
        <p class="steps__label">Envolva a aplicação com o provider e use os componentes</p>
        <CodeBlock :code="usageCode" />
      </li>
    </ol>
  </section>
</template>

<style scoped>
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.steps__item + .steps__item {
  margin-top: 28px;
}

.steps__label {
  margin: 0 0 10px;
  font-size: 13px;
  color: #9e9e9e;
  counter-increment: step;
}

.steps__label::before {
  content: counter(step) '. ';
  color: #6b6b6b;
}
</style>
