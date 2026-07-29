# Referência de componentes

Todos os componentes seguem as mesmas convenções:

- A escala de tamanhos usa os valores `sm`, `md` e `lg`, com `md` como padrão.
- Os campos de formulário usam `v-model` pela propriedade `modelValue`.
- Cada componente tem um único elemento raiz, então classes, estilos e atributos passados pelo
  consumidor chegam ao elemento final.
- Os tipos de todas as propriedades são exportados pelo pacote.

Para montar componentes de vidro próprios, veja [composicao.md](composicao.md).

## GlassProvider

Injeta o filtro SVG de refração, liga o motor de luz e detecta os recursos do navegador. Deve
envolver a aplicação uma única vez.

| Propriedade          | Tipo                          | Padrão   | Descrição                                        |
| -------------------- | ----------------------------- | -------- | ------------------------------------------------ |
| `refraction`         | `'auto' \| 'on' \| 'off'`     | `'auto'` | Modo de detecção do filtro de refração           |
| `refractionStrength` | `number`                      | `24`     | Intensidade do displacement, entre 12 e 40       |
| `trackPointer`       | `boolean`                     | `true`   | Liga o rastreamento do ponteiro                  |
| `grain`              | `boolean`                     | `true`   | Aplica o grain nas superfícies                   |
| `theme`              | `'dark' \| 'light' \| 'auto'` | `'dark'` | `'auto'` segue a preferência do sistema          |
| `lightFalloff`       | `number`                      | `900`    | Distância, a partir da borda, onde a luz para    |
| `lightHeight`        | `number`                      | `520`    | Altura virtual da fonte sobre a página           |
| `lightGain`          | `number`                      | `1`      | Multiplica a intensidade de todas as superfícies |

Slot padrão: conteúdo da aplicação.

As propriedades são reativas. Alterar qualquer uma delas depois da montagem reconfigura os efeitos na
hora, sem precisar remontar o provider.

Vários providers podem coexistir. O filtro de refração é montado uma única vez e só é removido quando
o último deles é desmontado.

## GlassSurface

Painel base de vidro, usado como bloco de construção dos demais componentes.

| Propriedade   | Tipo                                       | Padrão  | Descrição                    |
| ------------- | ------------------------------------------ | ------- | ---------------------------- |
| `elevation`   | `0 \| 1 \| 2 \| 3`                         | `1`     | Intensidade da sombra        |
| `interactive` | `boolean`                                  | `false` | Ativa a condensação no hover |
| `radius`      | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'`  | Raio das bordas              |
| `as`          | `string`                                   | `'div'` | Elemento HTML renderizado    |

## GlassCard

Painel com cabeçalho, corpo e rodapé prontos.

| Propriedade   | Tipo                                       | Padrão  | Descrição                              |
| ------------- | ------------------------------------------ | ------- | -------------------------------------- |
| `elevation`   | `0 \| 1 \| 2 \| 3`                         | `1`     | Intensidade da sombra                  |
| `radius`      | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'`  | Raio das bordas                        |
| `interactive` | `boolean`                                  | `false` | Ativa a condensação no hover           |
| `title`       | `string`                                   | `''`    | Título do cabeçalho                    |
| `as`          | `string`                                   | `'div'` | Use `'button'` para um cartão clicável |

Slots: padrão, `header` e `footer`.

## GlassDivider

| Propriedade | Tipo      | Padrão  | Descrição              |
| ----------- | --------- | ------- | ---------------------- |
| `vertical`  | `boolean` | `false` | Orientação             |
| `label`     | `string`  | `''`    | Texto no meio da régua |

Slot padrão: alternativa ao `label`.

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

| Propriedade    | Tipo                   | Padrão   | Descrição                              |
| -------------- | ---------------------- | -------- | -------------------------------------- |
| `modelValue`   | `string`               | `''`     | Valor do campo                         |
| `size`         | `'sm' \| 'md' \| 'lg'` | `'md'`   | Tamanho                                |
| `type`         | `string`               | `'text'` | Tipo nativo do input                   |
| `placeholder`  | `string`               | `''`     | Texto de apoio                         |
| `disabled`     | `boolean`              | `false`  | Desativa o campo                       |
| `readonly`     | `boolean`              | `false`  | Somente leitura                        |
| `invalid`      | `boolean`              | `false`  | Estado inválido, com borda tracejada   |
| `id`           | `string`               | derivado | Repassado ao input interno             |
| `name`         | `string`               | `''`     | Nome no formulário                     |
| `autocomplete` | `string`               | `''`     | Dica de preenchimento do navegador     |
| `required`     | `boolean`              | `false`  | Campo obrigatório                      |
| `prompt`       | `boolean`              | `false`  | Exibe o prefixo de prompt              |
| `blockCaret`   | `boolean`              | `false`  | Substitui o cursor nativo por um bloco |

Eventos: `update:modelValue`. Slots: `prefix` e `suffix`.

Expõe `input`, `focus()`, `blur()` e `select()`, então dá para colocar o foco no campo depois de um
envio que falhou sem procurar o elemento no DOM.

Dentro de um `GlassField`, o `id`, o `aria-describedby`, o estado inválido e o obrigatório vêm do
campo. Uma propriedade passada aqui sempre vence.

## GlassTextarea

| Propriedade   | Tipo                   | Padrão   | Descrição                             |
| ------------- | ---------------------- | -------- | ------------------------------------- |
| `modelValue`  | `string`               | `''`     | Valor do campo                        |
| `rows`        | `number`               | `4`      | Altura inicial em linhas              |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`   | Tamanho                               |
| `placeholder` | `string`               | `''`     | Texto de apoio                        |
| `disabled`    | `boolean`              | `false`  | Desativa o campo                      |
| `readonly`    | `boolean`              | `false`  | Somente leitura                       |
| `invalid`     | `boolean`              | `false`  | Estado inválido                       |
| `id`          | `string`               | derivado | Repassado ao textarea interno         |
| `name`        | `string`               | `''`     | Nome no formulário                    |
| `autosize`    | `boolean`              | `false`  | Cresce com o conteúdo em vez de rolar |

Eventos: `update:modelValue`. Expõe as mesmas quatro coisas do `GlassInput`.

## GlassField

Rótulo, descrição e mensagem de erro em volta de um controle. É o campo que gera o `id`, monta o
`aria-describedby` e decide o estado inválido, e o controle dentro dele apenas lê isso.

| Propriedade   | Tipo      | Padrão   | Descrição                                          |
| ------------- | --------- | -------- | -------------------------------------------------- |
| `label`       | `string`  | `''`     | Rótulo, associado ao controle pelo `for`           |
| `description` | `string`  | `''`     | Texto de apoio, ligado por `aria-describedby`      |
| `error`       | `string`  | `''`     | Mensagem de erro. A presença dela marca o inválido |
| `required`    | `boolean` | `false`  | Marca o campo como obrigatório                     |
| `id`          | `string`  | derivado | Id dado ao controle                                |

Slot padrão, que recebe `id` como propriedade de slot.

## GlassCheckbox

| Propriedade     | Tipo                   | Padrão   | Descrição                |
| --------------- | ---------------------- | -------- | ------------------------ |
| `modelValue`    | `boolean`              | `false`  | Estado da caixa          |
| `indeterminate` | `boolean`              | `false`  | Terceiro estado, `mixed` |
| `disabled`      | `boolean`              | `false`  | Desativa o controle      |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`   | Tamanho                  |
| `id`            | `string`               | derivado | Id do controle           |
| `name`          | `string`               | `''`     | Nome no formulário       |

Eventos: `update:modelValue`. Slot padrão: rótulo ao lado do controle.

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

## GlassAvatar

| Propriedade | Tipo                   | Padrão  | Descrição                                    |
| ----------- | ---------------------- | ------- | -------------------------------------------- |
| `src`       | `string`               | `''`    | Imagem. Cai nas iniciais se faltar ou falhar |
| `alt`       | `string`               | `''`    | Texto alternativo                            |
| `name`      | `string`               | `''`    | Nome de onde saem as iniciais                |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`  | Tamanho                                      |
| `square`    | `boolean`              | `false` | Troca o círculo por um quadrado arredondado  |

A imagem é dessaturada, porque a biblioteca inteira é monocromática por definição.

## GlassSpinner

| Propriedade | Tipo                   | Padrão | Descrição                                   |
| ----------- | ---------------------- | ------ | ------------------------------------------- |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho                                     |
| `speed`     | `number`               | `80`   | Milissegundos por quadro                    |
| `label`     | `string`               | `''`   | Nome acessível. Sem ele, fica `aria-hidden` |

Com `prefers-reduced-motion` ativo, a animação não roda. A preferência é observada em tempo real, não
lida uma vez na montagem.

## GlassSkeleton

| Propriedade | Tipo                                       | Padrão   | Descrição                               |
| ----------- | ------------------------------------------ | -------- | --------------------------------------- |
| `width`     | `string`                                   | `'100%'` | Largura de cada barra                   |
| `height`    | `string`                                   | `''`     | Altura. Vazio usa a altura de uma linha |
| `radius`    | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'sm'`   | Raio das bordas                         |
| `lines`     | `number`                                   | `1`      | Número de barras empilhadas             |

Com mais de uma linha e sem altura fixa, a última sai mais curta, que é o que faz o bloco ler como
texto. O brilho corre na mesma direção da luz das outras superfícies.

## GlassAlert

| Propriedade  | Tipo                                       | Padrão      | Descrição                  |
| ------------ | ------------------------------------------ | ----------- | -------------------------- |
| `variant`    | `'info' \| 'warn' \| 'error' \| 'success'` | `'info'`    | Peso e marcador            |
| `title`      | `string`                                   | `''`        | Título                     |
| `closable`   | `boolean`                                  | `false`     | Exibe o botão de dispensar |
| `closeLabel` | `string`                                   | `'Dismiss'` | Nome acessível desse botão |

Eventos: `close`. Slot padrão: corpo da mensagem.

A paleta não tem cor, então a variante se lê pela régua da esquerda e por um glifo. O `error` usa
`role="alert"` e os demais usam `role="status"`.

## GlassTooltip

| Propriedade | Tipo             | Padrão  | Descrição                       |
| ----------- | ---------------- | ------- | ------------------------------- |
| `content`   | `string`         | `''`    | Texto da dica                   |
| `placement` | `GlassPlacement` | `'top'` | Lado preferido                  |
| `delay`     | `number`         | `200`   | Espera antes de aparecer, em ms |
| `disabled`  | `boolean`        | `false` | Desliga a dica                  |

Slots: padrão, que é o gatilho, e `content` para conteúdo mais rico que texto.

Aparece no hover e no foco, e some com Esc. O painel se inverte quando não cabe do lado pedido e
desliza no eixo transversal para não vazar da janela.

## GlassPopover

| Propriedade      | Tipo             | Padrão           | Descrição                                       |
| ---------------- | ---------------- | ---------------- | ----------------------------------------------- |
| `modelValue`     | `boolean`        | indefinido       | Omitido, o componente controla o próprio estado |
| `placement`      | `GlassPlacement` | `'bottom-start'` | Lado preferido                                  |
| `closeOnOutside` | `boolean`        | `true`           | Fecha ao clicar fora                            |
| `closeOnEsc`     | `boolean`        | `true`           | Fecha com Esc                                   |
| `offset`         | `number`         | `8`              | Distância até o gatilho, em px                  |

Eventos: `update:modelValue` e `close`. Slots: padrão (o painel), `trigger` e `label`.

Ao abrir, o foco vai para o painel e volta ao elemento anterior quando fecha. O painel some se o
gatilho sair de um container com rolagem própria.

`GlassPlacement` aceita `'top'`, `'top-start'`, `'top-end'`, `'bottom'`, `'bottom-start'`,
`'bottom-end'`, `'left'` e `'right'`.

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

| Propriedade      | Tipo      | Padrão    | Descrição                         |
| ---------------- | --------- | --------- | --------------------------------- |
| `modelValue`     | `boolean` | requerido | Controla a abertura               |
| `title`          | `string`  | `''`      | Título exibido no cabeçalho       |
| `width`          | `string`  | `'28rem'` | Largura do painel                 |
| `closeOnOverlay` | `boolean` | `true`    | Fecha ao clicar fora              |
| `closeOnEsc`     | `boolean` | `true`    | Fecha com a tecla Esc             |
| `closable`       | `boolean` | `true`    | Exibe o botão de fechar           |
| `closeLabel`     | `string`  | `'Close'` | Nome acessível do botão de fechar |

Eventos: `update:modelValue` e `close`. Slots: padrão, `header` e `footer`.

O botão de fechar aparece mesmo sem título e sem slot de cabeçalho. Até a 0.1.0 ele ficava dentro da
mesma condição do cabeçalho, então um diálogo sem título só saía pelo Esc.

Ao abrir, o componente prende o foco no painel, bloqueia a rolagem da página e devolve o foco ao
elemento anterior quando fecha. Ao bloquear a rolagem, a largura da barra é compensada com um
espaçamento equivalente, então o conteúdo da página não desloca quando o modal abre e fecha.

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
Expõe `replay()`.

Alterar `lines`, `typewriter` ou `speed` reinicia a digitação. Na 0.1.0 essas mudanças eram ignoradas
até o componente ser remontado.

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

## useGlassConfig

Lê as configurações do `GlassProvider` mais próximo.

```ts
const config = useGlassConfig()

config.grain // boolean
config.refraction // 'auto', 'on' ou 'off'
config.theme // 'dark', 'light' ou 'auto'
```

O objeto é reativo, então um componente que lê `config.grain` volta a renderizar quando a
propriedade do provider muda. Sem provider acima, devolve os padrões.

## useGlassSurface e v-glass

Descritos em [composicao.md](composicao.md), junto do plugin de instalação, do resolver de
auto-importação e das propriedades customizadas que o motor de luz escreve em cada superfície.
