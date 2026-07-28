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
- **Fonte de luz global.** Um único listener de ponteiro atualiza duas variáveis CSS, e todos os
  componentes da página reagem em conjunto, sem JavaScript por componente.
- **Paleta monocromática.** Apenas preto, branco e cinzas, com grain fotográfico e tipografia
  monoespaçada.

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
| `GlassProvider` | Motor de luz, filtro de refração e configuração global           |
| `GlassSurface`  | Painel base de vidro, com elevação, raio e estado interativo     |
| `GlassButton`   | Botão nas variantes solid e ghost, com indicador de carregamento |
| `GlassInput`    | Campo de texto com cursor em bloco e prefixo de prompt opcionais |
| `GlassSwitch`   | Interruptor acessível, com `role="switch"`                       |
| `GlassKbd`      | Tecla para exibir atalhos de teclado                             |
| `GlassBadge`    | Etiqueta de status, com ponto e pulsação opcionais               |
| `GlassProgress` | Barra de progresso em linha fina ou em blocos de texto           |
| `GlassModal`    | Diálogo com teleporte para o body e foco preso                   |
| `GlassTerminal` | Janela de terminal com efeito de digitação                       |

A referência completa de propriedades, eventos e slots está em
[docs/componentes.md](./docs/componentes.md). Os tokens de tema estão em
[docs/tokens.md](./docs/tokens.md).

## Compatibilidade

| Navegador       | Resultado                        |
| --------------- | -------------------------------- |
| Chrome, Edge    | Refração, blur e brilho dinâmico |
| Firefox, Safari | Blur e brilho dinâmico           |
| Sem suporte     | Superfície sólida translúcida    |

## Acessibilidade

A preferência `prefers-reduced-motion` desliga o rastreamento do ponteiro e as animações. A
preferência `prefers-reduced-transparency` substitui o vidro por superfícies sólidas.

## Contribuindo

Leia o [guia de contribuição](./CONTRIBUTING.md) antes de abrir um pull request.

## Licença

[MIT](./LICENSE) © Vitor Zanetti
