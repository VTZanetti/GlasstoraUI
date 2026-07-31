# Composição

A biblioteca não é só o catálogo. As mesmas peças que os componentes usam por dentro estão
exportadas, então dá para montar componentes de vidro próprios que respondem à mesma fonte de luz.

## useGlassSurface

Transforma um elemento em superfície de vidro e o registra no motor de luz.

```vue
<script setup lang="ts">
import { useGlassSurface } from 'glasstora'

const { surfaceAttrs } = useGlassSurface({ interactive: true, elevation: 2, radius: 'lg' })
</script>

<template>
  <article v-bind="surfaceAttrs">
    <slot />
  </article>
</template>
```

O objeto `surfaceAttrs` carrega as classes e a própria referência do elemento, então um único
`v-bind` resolve tudo. Não existe `ref="..."` para escrever.

| Opção         | Tipo                                       | Padrão     | Descrição                                                      |
| ------------- | ------------------------------------------ | ---------- | -------------------------------------------------------------- |
| `glass`       | `boolean`                                  | `true`     | `false` pega a luz sem o blur, o grain e o anel                |
| `interactive` | `boolean`                                  | `false`    | Condensa no hover                                              |
| `elevation`   | `0 \| 1 \| 2 \| 3`                         | indefinido | Omitido, o CSS do próprio componente decide                    |
| `radius`      | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | indefinido | Omitido, o CSS do próprio componente decide                    |
| `volatile`    | `boolean`                                  | `false`    | Remede a cada quadro, para elementos que se movem sozinhos     |
| `light`       | `boolean`                                  | `true`     | `false` mantém o elemento na receita antiga, em espaço de tela |
| `gain`        | `number`                                   | `1`        | Multiplica a intensidade só desta superfície                   |
| `ring`        | `boolean`                                  | `true`     | `false` desliga o anel especular                               |
| `grain`       | `boolean`                                  | `true`     | `false` desliga o grain                                        |
| `el`          | `Ref<HTMLElement \| null>`                 | interno    | Reaproveita uma referência que você já tem                     |
| `onLight`     | `(light) => void`                          | indefinido | Recebe os valores resolvidos a cada escrita                    |

Retorna `surfaceRef`, `surfaceAttrs` e `measure()`. O `measure()` força uma nova medição, para
mudanças de layout que nenhum observador consegue perceber.

O retorno não inclui ligação de `style`, de propósito. As propriedades `--gt-light-*` inline do
elemento pertencem ao motor, que as reescreve até sessenta vezes por segundo, e um segundo escritor
no mesmo `el.style` traria uma classe inteira de problemas.

## Diretiva v-glass

Para elementos avulsos, sem criar componente.

```vue
<div v-glass>painel</div>
<div v-glass="{ elevation: 2, radius: 'lg', gain: 1.4 }">painel com ajuste</div>
<div v-glass.interactive.volatile>painel que se move</div>
<div v-glass.no-light>fora do motor de luz</div>
```

Modificadores disponíveis: `interactive`, `volatile`, `flat` (elevação 0), `no-light`, `no-ring` e
`no-grain`. Eles são fixos em tempo de compilação, então servem para o que é booleano. O que muda em
tempo de execução vai no valor, que vence o modificador quando os dois falam da mesma coisa.

A diretiva implementa `getSSRProps`, então o servidor já emite as classes de vidro e não há
divergência de hidratação nem piscada.

## Instalação global

```ts
import { createApp } from 'vue'
import { Glasstora } from 'glasstora/plugin'
import 'glasstora/style.css'

createApp(App).use(Glasstora)
```

| Opção        | Tipo                                   | Padrão     | Descrição                                                  |
| ------------ | -------------------------------------- | ---------- | ---------------------------------------------------------- |
| `prefix`     | `string`                               | `'Glass'`  | Substitui o prefixo dos nomes registrados                  |
| `components` | `boolean \| Record<string, Component>` | `true`     | `false` não registra nada, objeto registra só o que contém |
| `directive`  | `boolean`                              | `true`     | Registra `v-glass`                                         |
| `light`      | `Partial<LightTuning>`                 | indefinido | Ajusta o motor de luz na instalação                        |

Instalar o plugin traz o catálogo inteiro, por definição. Quem se importa com o tamanho do pacote
deve continuar usando importações nomeadas, ou o resolver abaixo.

## Auto-importação

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { GlasstoraResolver } from 'glasstora/resolver'

export default {
  plugins: [Components({ resolvers: [GlasstoraResolver()] })],
}
```

O módulo `glasstora/resolver` roda dentro do bundler e não importa Vue nem a folha de estilo.

Além do componente, o resolver importa o estilo dele: a base compartilhada mais a folha daquele
componente. Uma página com três componentes carrega quatro arquivos pequenos em vez do
`style.css` inteiro, e você não escreve nenhum `import` de CSS. Não é preciso importar
`glasstora/style.css` quando o resolver está em uso.

| Opção    | Tipo                  | Padrão    | Descrição                                          |
| -------- | --------------------- | --------- | -------------------------------------------------- |
| `prefix` | `string`              | `'Glass'` | Prefixo usado nos templates                        |
| `css`    | `'split' \| 'bundle'` | `'split'` | `'bundle'` volta a apontar tudo para o `style.css` |

Use `css: 'bundle'` se o seu empacotador não resolver subcaminhos de `exports`, ou se você preferir
uma única folha em cache.

Para o autocomplete dos componentes em templates que não os importam, referencie os tipos globais em
algum `.d.ts` do seu projeto:

```ts
/// <reference types="glasstora/global" />
```

Isso é opcional de propósito. Quem usa importações nomeadas não deveria ganhar trinta e seis nomes no
escopo de todo template.

## Motor de luz

```ts
import { configureLight, getLightTuning, useGlassLight } from 'glasstora'

configureLight({ falloff: 1200, height: 400, gain: 1.2 })
```

| Ajuste    | Padrão | Descrição                                                      |
| --------- | ------ | -------------------------------------------------------------- |
| `falloff` | `900`  | Distância em px, a partir da borda, onde a luz deixa de chegar |
| `height`  | `520`  | Altura virtual da fonte sobre o plano da página                |
| `gain`    | `1`    | Multiplica a intensidade de todas as superfícies               |

As mesmas três coisas estão no `GlassProvider` como `lightFalloff`, `lightHeight` e `lightGain`.

Cada superfície registrada recebe cinco propriedades customizadas, que qualquer CSS pode ler:

| Propriedade            | Unidade      | Significado                                          |
| ---------------------- | ------------ | ---------------------------------------------------- |
| `--gt-light-u`         | porcentagem  | Posição da luz no eixo X, relativa à própria caixa   |
| `--gt-light-v`         | porcentagem  | Posição da luz no eixo Y, relativa à própria caixa   |
| `--gt-light-angle`     | grau         | Direção da luz, na convenção do `linear-gradient`    |
| `--gt-light-energy`    | número 0 a 1 | Quanto a luz alcança esta superfície                 |
| `--gt-light-incidence` | número 0 a 1 | Quão a pino a luz incide, de rasante a perpendicular |

Exemplo de uso direto, para dar direção a um elemento que não é vidro:

```css
.minha-borda {
  background-image: linear-gradient(
    var(--gt-light-angle),
    transparent 40%,
    rgb(255 255 255 / calc(0.12 * var(--gt-light-energy))) 100%
  );
}
```

## Camadas de cascata

Toda a folha de estilo vive dentro de `@layer glasstora`. Qualquer regra sua que não esteja em uma
camada vence a biblioteca, independentemente de especificidade, então sobrescrever um componente não
exige guerra de seletores.

A única exceção é intencional: dentro de uma camada, a ordem das declarações `!important` se inverte,
então os blocos de `prefers-reduced-transparency` continuam ganhando de qualquer `!important` seu.
A anulação de acessibilidade ficou mais forte, não mais fraca.
