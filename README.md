<h1 align="center">Glasstora</h1>

<p align="center">
  Componentes de vidro líquido monocromático para Vue 3, com refração real e uma fonte de luz global.
</p>

<p align="center">
  <a href="https://github.com/VTZanetti/GlasstoraUI/actions/workflows/ci.yml"><img src="https://github.com/VTZanetti/GlasstoraUI/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/glasstora"><img src="https://img.shields.io/npm/v/glasstora" alt="npm"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="MIT"></a>
</p>

<p align="center">
  <a href="https://glasstora.zanetti.tech/"><strong>Ver a demo</strong></a>
</p>

## Diferenciais

A maioria das bibliotecas de glassmorphism aplica apenas blur e transparência. O Glasstora faz três
coisas além disso:

- **Refração real.** Em navegadores Chromium, um filtro SVG de displacement distorce o fundo que
  passa através do vidro. Nos demais, o efeito degrada para blur sem quebrar o layout.
- **Fonte de luz com geometria por elemento.** Um único laço de animação calcula, para cada
  superfície, onde a luz está em relação à própria caixa dela, de que ângulo vem e com que força
  chega. Isso funciona dentro de modais, de elementos transformados, de contêineres com rolagem e no
  iOS, que são justamente os lugares onde uma fonte de luz posicionada em espaço de tela se perde.
- **Paleta monocromática.** Apenas preto, branco e cinzas, com grain fotográfico e tipografia
  monoespaçada. Tema claro disponível, onde a direção da luz se lê por sombreamento.

Além disso, o pacote não tem dependências de runtime. Apenas o Vue 3 como peer dependency.

## Instalação

```bash
npm install glasstora
```

## Uso

Importe a folha de estilo uma vez, no ponto de entrada da aplicação:

```ts
import 'glasstora/style.css'
```

Envolva a aplicação com o `GlassProvider`, que injeta o filtro de refração e liga o motor de luz:

```vue
<script setup>
import { GlassProvider, GlassButton, GlassTerminal } from 'glasstora'
</script>

<template>
  <GlassProvider>
    <GlassTerminal :lines="['npm i glasstora']" typewriter />
    <GlassButton>executar</GlassButton>
  </GlassProvider>
</template>
```

## Componentes

| Componente      | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| `GlassProvider` | Motor de luz, filtro de refração, tema e configuração global     |
| `GlassSurface`  | Painel base de vidro, com elevação, raio e estado interativo     |
| `GlassCard`     | Painel com cabeçalho, corpo e rodapé prontos                     |
| `GlassDivider`  | Régua horizontal ou vertical, com rótulo opcional                |
| `GlassButton`   | Botão nas variantes solid e ghost, com indicador de carregamento |
| `GlassField`    | Rótulo, descrição e erro em volta de um controle de formulário   |
| `GlassInput`    | Campo de texto com cursor em bloco e prefixo de prompt opcionais |
| `GlassTextarea` | Campo de várias linhas, com crescimento automático opcional      |
| `GlassCheckbox` | Caixa de seleção, com terceiro estado                            |
| `GlassSwitch`   | Interruptor acessível, com `role="switch"`                       |
| `GlassKbd`      | Tecla para exibir atalhos de teclado                             |
| `GlassBadge`    | Etiqueta de status, com ponto e pulsação opcionais               |
| `GlassAvatar`   | Retrato circular ou quadrado, com iniciais de reserva            |
| `GlassSpinner`  | Indicador de carregamento em braille                             |
| `GlassSkeleton` | Espaço reservado com brilho na direção da luz                    |
| `GlassProgress` | Barra de progresso em linha fina ou em blocos de texto           |
| `GlassAlert`    | Aviso em quatro pesos, sem depender de cor                       |
| `GlassTooltip`  | Dica flutuante que se inverte quando não cabe                    |
| `GlassPopover`  | Painel flutuante com fechamento por Esc e por clique fora        |
| `GlassModal`    | Diálogo com teleporte para o body e foco preso                   |
| `GlassTerminal` | Janela de terminal com efeito de digitação                       |

A referência completa de propriedades, eventos e slots está em
[docs/componentes.md](./docs/componentes.md). Os tokens de tema estão em
[docs/tokens.md](./docs/tokens.md).

## Compondo os seus próprios

As peças que os componentes usam por dentro também são exportadas, então dá para montar superfícies
de vidro próprias que respondem à mesma fonte de luz:

```vue
<script setup>
import { useGlassSurface } from 'glasstora'

const { surfaceAttrs } = useGlassSurface({ interactive: true, elevation: 2 })
</script>

<template>
  <article v-bind="surfaceAttrs"><slot /></article>
</template>
```

Existe também a diretiva `v-glass` para elementos avulsos, o plugin `app.use(Glasstora)` para
registro global e um resolver para `unplugin-vue-components`. Tudo isso está em
[docs/composicao.md](./docs/composicao.md).

## Compatibilidade

| Navegador             | Resultado                        |
| --------------------- | -------------------------------- |
| Chrome, Edge          | Refração, blur e brilho dinâmico |
| Firefox, Safari       | Blur e brilho dinâmico           |
| Safari no iOS         | Blur e brilho dinâmico           |
| Sem `backdrop-filter` | Superfície sólida translúcida    |

## Acessibilidade

A preferência `prefers-reduced-motion` desliga o rastreamento do ponteiro e as animações, mas cada
superfície ainda recebe uma passada estática, então o reflexo continua coerente com a posição dela.
A preferência `prefers-reduced-transparency` substitui o vidro por superfícies sólidas.

## Contribuindo

Leia o [guia de contribuição](./CONTRIBUTING.md) antes de abrir um pull request.

## Licença

[MIT](./LICENSE) © Vitor Zanetti
