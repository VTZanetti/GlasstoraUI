# Referência de componentes

Todos os componentes seguem as mesmas convenções:

- A escala de tamanhos usa os valores `sm`, `md` e `lg`, com `md` como padrão.
- Os campos de formulário usam `v-model` pela propriedade `modelValue`.
- Cada componente tem um único elemento raiz, então classes, estilos e atributos passados pelo
  consumidor chegam ao elemento final.
- Os tipos de todas as propriedades são exportados pelo pacote.

## GlassProvider

Injeta o filtro SVG de refração, liga o motor de luz e detecta os recursos do navegador. Deve
envolver a aplicação uma única vez.

| Propriedade          | Tipo                      | Padrão   | Descrição                                  |
| -------------------- | ------------------------- | -------- | ------------------------------------------ |
| `refraction`         | `'auto' \| 'on' \| 'off'` | `'auto'` | Modo de detecção do filtro de refração     |
| `refractionStrength` | `number`                  | `24`     | Intensidade do displacement, entre 12 e 40 |
| `trackPointer`       | `boolean`                 | `true`   | Liga o rastreamento do ponteiro            |
| `grain`              | `boolean`                 | `true`   | Aplica o grain nas superfícies             |

Slot padrão: conteúdo da aplicação.

## GlassSurface

Painel base de vidro, usado como bloco de construção dos demais componentes.

| Propriedade   | Tipo                   | Padrão  | Descrição                    |
| ------------- | ---------------------- | ------- | ---------------------------- |
| `elevation`   | `0 \| 1 \| 2 \| 3`     | `1`     | Intensidade da sombra        |
| `interactive` | `boolean`              | `false` | Ativa a condensação no hover |
| `radius`      | `'sm' \| 'md' \| 'lg'` | `'md'`  | Raio das bordas              |
| `as`          | `string`               | `'div'` | Elemento HTML renderizado    |

## GlassButton

| Propriedade | Tipo                              | Padrão     | Descrição                              |
| ----------- | --------------------------------- | ---------- | -------------------------------------- |
| `variant`   | `'solid' \| 'ghost'`              | `'solid'`  | Peso visual do botão                   |
| `size`      | `'sm' \| 'md' \| 'lg'`            | `'md'`     | Tamanho                                |
| `loading`   | `boolean`                         | `false`    | Mostra o indicador e bloqueia o clique |
| `disabled`  | `boolean`                         | `false`    | Desativa o botão                       |
| `type`      | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo nativo                            |

Eventos: `click`, emitido apenas quando o botão está ativo.

## GlassInput

| Propriedade   | Tipo                   | Padrão   | Descrição                              |
| ------------- | ---------------------- | -------- | -------------------------------------- |
| `modelValue`  | `string`               | `''`     | Valor do campo                         |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`   | Tamanho                                |
| `type`        | `string`               | `'text'` | Tipo nativo do input                   |
| `placeholder` | `string`               | `''`     | Texto de apoio                         |
| `disabled`    | `boolean`              | `false`  | Desativa o campo                       |
| `invalid`     | `boolean`              | `false`  | Estado inválido, com borda tracejada   |
| `prompt`      | `boolean`              | `false`  | Exibe o prefixo de prompt              |
| `blockCaret`  | `boolean`              | `false`  | Substitui o cursor nativo por um bloco |

Eventos: `update:modelValue`. Slots: `prefix` e `suffix`.

## GlassSwitch

| Propriedade  | Tipo                   | Padrão  | Descrição             |
| ------------ | ---------------------- | ------- | --------------------- |
| `modelValue` | `boolean`              | `false` | Estado do interruptor |
| `disabled`   | `boolean`              | `false` | Desativa o controle   |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`  | Tamanho               |

Eventos: `update:modelValue`. Slot padrão: rótulo exibido ao lado do controle.

## GlassKbd

Sem propriedades. O tamanho acompanha a fonte do contexto. Slot padrão: texto da tecla.

## GlassBadge

| Propriedade | Tipo                                | Padrão      | Descrição               |
| ----------- | ----------------------------------- | ----------- | ----------------------- |
| `variant`   | `'neutral' \| 'outline' \| 'solid'` | `'neutral'` | Estilo da etiqueta      |
| `dot`       | `boolean`                           | `true`      | Exibe o ponto indicador |
| `pulse`     | `boolean`                           | `false`     | Faz o ponto pulsar      |

## GlassProgress

| Propriedade     | Tipo                   | Padrão   | Descrição                             |
| --------------- | ---------------------- | -------- | ------------------------------------- |
| `value`         | `number`               | `0`      | Valor atual                           |
| `max`           | `number`               | `100`    | Valor máximo                          |
| `mode`          | `'line' \| 'ascii'`    | `'line'` | Barra fina ou blocos de texto         |
| `cols`          | `number`               | `20`     | Número de colunas no modo `ascii`     |
| `showValue`     | `boolean`              | `false`  | Exibe o percentual                    |
| `indeterminate` | `boolean`              | `false`  | Animação contínua, sem valor definido |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`   | Espessura da barra                    |

## GlassModal

| Propriedade      | Tipo      | Padrão    | Descrição                   |
| ---------------- | --------- | --------- | --------------------------- |
| `modelValue`     | `boolean` | requerido | Controla a abertura         |
| `title`          | `string`  | `''`      | Título exibido no cabeçalho |
| `width`          | `string`  | `'28rem'` | Largura do painel           |
| `closeOnOverlay` | `boolean` | `true`    | Fecha ao clicar fora        |
| `closeOnEsc`     | `boolean` | `true`    | Fecha com a tecla Esc       |

Eventos: `update:modelValue` e `close`. Slots: padrão, `header` e `footer`.

Ao abrir, o componente prende o foco no painel, bloqueia a rolagem da página e devolve o foco ao
elemento anterior quando fecha.

## GlassTerminal

| Propriedade  | Tipo       | Padrão        | Descrição                              |
| ------------ | ---------- | ------------- | -------------------------------------- |
| `title`      | `string`   | `'glasstora'` | Título na barra da janela              |
| `lines`      | `string[]` | `[]`          | Linhas exibidas ou digitadas           |
| `typewriter` | `boolean`  | `false`       | Ativa o efeito de digitação            |
| `speed`      | `number`   | `24`          | Milissegundos por caractere            |
| `prompt`     | `string`   | `'>'`         | Prefixo de cada linha                  |
| `scanlines`  | `boolean`  | `false`       | Aplica a textura de linhas horizontais |

Eventos: `done`, emitido quando a digitação termina. Slot padrão: usado quando `lines` está vazio.

Com `prefers-reduced-motion` ativo, o texto aparece de uma vez. O conteúdo completo também fica
disponível para leitores de tela enquanto a versão animada é ignorada por eles.

## useGlassLight

Composable que expõe a fonte de luz global.

```ts
const light = useGlassLight()

light.x.value // posição horizontal em pixels
light.y.value // posição vertical em pixels
light.mode.value // 'pointer', 'drift' ou 'static'
light.set(400, 300) // move a luz e suspende o modo automático
light.resume() // devolve o controle ao modo automático
```

Sem um `GlassProvider` acima na árvore, o composable devolve valores estáticos e registra um aviso
no console, sem lançar erro.
