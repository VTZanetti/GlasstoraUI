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

| Propriedade | Tipo                   | Padrão | Descrição                                       |
| ----------- | ---------------------- | ------ | ----------------------------------------------- |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho                                         |
| `speed`     | `number`               | `12`   | Quadros por segundo. Mais alto gira mais rápido |
| `label`     | `string`               | `''`   | Nome acessível. Sem ele, fica `aria-hidden`     |

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

| Propriedade     | Tipo                                      | Padrão   | Descrição                                    |
| --------------- | ----------------------------------------- | -------- | -------------------------------------------- |
| `value`         | `number`                                  | `0`      | Valor atual                                  |
| `max`           | `number`                                  | `100`    | Valor máximo                                 |
| `mode`          | `'line' \| 'ascii' \| 'blocks' \| 'dots'` | `'line'` | Ver abaixo                                   |
| `cols`          | `number`                                  | `20`     | Células nos modos `ascii`, `blocks` e `dots` |
| `showValue`     | `boolean`                                 | `false`  | Exibe o percentual                           |
| `indeterminate` | `boolean`                                 | `false`  | Animação contínua, sem valor definido        |
| `size`          | `'sm' \| 'md' \| 'lg'`                    | `'md'`   | Espessura da barra                           |

São quatro modos: `line` é uma barra contínua fina; `ascii` escreve a barra em caracteres de bloco,
no espírito das barras de instalação de pacotes; `blocks` é a mesma leitura célula a célula, mas
desenhada em vez de escrita; e `dots` é a mesma coisa na densidade de uma régua braille. Os três
modos de célula compartilham a varredura do estado indeterminado, então a banda percorre a barra do
mesmo jeito em todos.

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

## GlassRadioGroup e GlassRadio

O grupo é dono do valor e do nome; o rádio só sabe quanto vale. Por isso o `v-model` fica no grupo e
o `GlassField` em volta descreve o grupo, não cada opção.

| Propriedade   | Tipo                         | Padrão       | Descrição                        |
| ------------- | ---------------------------- | ------------ | -------------------------------- |
| `modelValue`  | `string \| number`           | indefinido   | Opção escolhida                  |
| `name`        | `string`                     | `''`         | Nome compartilhado no formulário |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Eixo das setas                   |
| `disabled`    | `boolean`                    | `false`      | Desativa o grupo inteiro         |
| `size`        | `'sm' \| 'md' \| 'lg'`       | `'md'`       | Tamanho, herdado pelos rádios    |

O `GlassRadio` recebe apenas `value` (obrigatório), `disabled` e `id`.

Eventos do grupo: `update:modelValue` e `change`. Slot padrão do grupo: os rádios. Slot padrão do
rádio: o rótulo ao lado do ponto.

O grupo tem uma parada de tabulação só, que fica na opção marcada. As setas movem **e** selecionam,
que é o comportamento de um grupo de rádio; `Home` e `End` vão às pontas e opções desativadas são
puladas.

## GlassSlider

| Propriedade   | Tipo                        | Padrão     | Descrição                                     |
| ------------- | --------------------------- | ---------- | --------------------------------------------- |
| `modelValue`  | `number`                    | `min`      | Valor                                         |
| `min`         | `number`                    | `0`        | Limite inferior                               |
| `max`         | `number`                    | `100`      | Limite superior                               |
| `step`        | `number`                    | `1`        | Granularidade                                 |
| `showValue`   | `boolean`                   | `false`    | Imprime o valor ao lado da trilha             |
| `formatValue` | `(value: number) => string` | indefinido | Formata o valor e alimenta o `aria-valuetext` |
| `disabled`    | `boolean`                   | `false`    | Desativa o controle                           |
| `label`       | `string`                    | `''`       | Nome acessível, quando nada aponta para ele   |

Eventos: `update:modelValue` a cada movimento e `change` ao soltar.

Teclado: setas andam um passo, `PageUp` e `PageDown` andam dez, `Home` e `End` vão aos limites. O
valor é sempre arredondado às casas decimais do próprio `step`, então um passo de `0.1` não produz
`0.30000000000000004`.

## GlassSelect

| Propriedade   | Tipo                       | Padrão           | Descrição                                    |
| ------------- | -------------------------- | ---------------- | -------------------------------------------- |
| `modelValue`  | `string \| number \| null` | `null`           | Valor escolhido                              |
| `options`     | `GlassSelectOption[]`      | obrigatório      | `{ label, value, disabled? }`                |
| `placeholder` | `string`                   | `'Select…'`      | Texto sem escolha                            |
| `placement`   | `GlassPlacement`           | `'bottom-start'` | Lado preferido do painel                     |
| `disabled`    | `boolean`                  | `false`          | Desativa o controle                          |
| `name`        | `string`                   | `''`             | Cria um campo oculto para formulários comuns |

Eventos: `update:modelValue`, `change`, `open`, `close`. Slots: `selected` para o valor no gatilho e
`option` para cada linha da lista.

O painel é teleportado para o `body` e posicionado pela camada flutuante da biblioteca, que se
inverte quando não cabe. A navegação é por `aria-activedescendant`: o foco fica no gatilho e a lista
é apontada por referência, o que evita tirar o foco de um diálogo em que o select esteja. Digitar
salta para a opção correspondente.

## GlassCombobox

Tudo do `GlassSelect`, com o gatilho trocado por um campo de texto que filtra a lista.

| Propriedade        | Tipo                         | Padrão         | Descrição                          |
| ------------------ | ---------------------------- | -------------- | ---------------------------------- |
| `filter`           | `(query, option) => boolean` | substring      | Substitui a busca padrão           |
| `noResultsLabel`   | `string`                     | `'No results'` | Texto quando nada casa             |
| `allowCustomValue` | `boolean`                    | `false`        | Aceita o texto digitado como valor |

A busca padrão ignora maiúsculas e acentos, então `acao` encontra `ação`. O `placeholder` começa em
`'Search…'`, e não em `'Select…'`, porque aqui se digita.

## GlassMenu

| Propriedade  | Tipo               | Padrão           | Descrição                                                        |
| ------------ | ------------------ | ---------------- | ---------------------------------------------------------------- |
| `modelValue` | `boolean`          | indefinido       | Aberto. Sem ele o menu se controla                               |
| `items`      | `GlassMenuEntry[]` | obrigatório      | `{ label, value?, disabled?, danger? }` ou `{ separator: true }` |
| `placement`  | `GlassPlacement`   | `'bottom-start'` | Lado preferido                                                   |

Eventos: `update:modelValue`, `select` com o item, `open`, `close`. Slots: `trigger` com
`{ open, toggle, attrs }` e `item` para cada entrada. Expõe `open`, `setOpen` e `toggle`.

Aqui o foco entra no painel, que é o padrão de menu. Seta para baixo no gatilho abre e foca o
primeiro item; escolher algo ou apertar `Escape` fecha e devolve o foco ao gatilho.

## GlassTabs e GlassTabPanel

| Propriedade  | Tipo                      | Padrão        | Descrição                       |
| ------------ | ------------------------- | ------------- | ------------------------------- |
| `modelValue` | `string`                  | primeira aba  | Aba ativa                       |
| `tabs`       | `GlassTabItem[]`          | obrigatório   | `{ label, value, disabled? }`   |
| `activation` | `'automatic' \| 'manual'` | `'automatic'` | Se as setas já selecionam       |
| `label`      | `string`                  | `'Tabs'`      | Nome acessível da lista de abas |

O `GlassTabPanel` recebe só `value`, que casa com o da aba. Os ids dos dois lados são derivados do
mesmo valor, então eles se encontram sem registro bidirecional, e um valor com espaço ou acento é
higienizado antes de virar id.

Use `activation: 'manual'` quando o conteúdo do painel for caro de renderizar: as setas movem o foco
e só `Enter` ou espaço trocam a aba.

## GlassAccordion

| Propriedade  | Tipo                   | Padrão      | Descrição                        |
| ------------ | ---------------------- | ----------- | -------------------------------- |
| `modelValue` | `string \| string[]`   | fechado     | Seção aberta, ou lista delas     |
| `items`      | `GlassAccordionItem[]` | obrigatório | `{ value, title, disabled? }`    |
| `multiple`   | `boolean`              | `false`     | Permite mais de uma seção aberta |

Eventos: `update:modelValue` e `change`. Slots: um por item, nomeado pelo `value`, com `content` e
`title` como alternativas genéricas.

A altura anima por `grid-template-rows`, sem medir nada em JavaScript.

## GlassBreadcrumb

| Propriedade   | Tipo                    | Padrão             | Descrição                                     |
| ------------- | ----------------------- | ------------------ | --------------------------------------------- |
| `items`       | `GlassBreadcrumbItem[]` | obrigatório        | `{ label, href? }`                            |
| `maxItems`    | `number`                | `0`                | Colapsa o meio acima disso. `0` nunca colapsa |
| `separator`   | `string`                | `'/'`              | Separador                                     |
| `expandLabel` | `string`                | `'Show all pages'` | Nome do botão de reticências                  |

Slots: `item` com `{ item, index, last }`, para injetar um `RouterLink`, e `separator`.

O colapso é por contagem, não por medição: uma trilha que decide pela largura teria que renderizar
duas vezes e a resposta mudaria com o contêiner. O último item nunca é escondido, e o
`aria-current="page"` fica no `<li>`, que é o único lugar que sobrevive à troca do conteúdo pelo slot.

## GlassPagination

| Propriedade     | Tipo                       | Padrão           | Descrição                              |
| --------------- | -------------------------- | ---------------- | -------------------------------------- |
| `modelValue`    | `number`                   | `1`              | Página atual, contando de um           |
| `pageCount`     | `number`                   | obrigatório      | Total de páginas                       |
| `siblingCount`  | `number`                   | `1`              | Páginas mantidas de cada lado da atual |
| `boundaryCount` | `number`                   | `1`              | Páginas mantidas em cada ponta         |
| `pageLabel`     | `(page: number) => string` | o próprio número | Nome acessível de cada botão           |

Eventos: `update:modelValue` e `change`.

As reticências são um `<span>` inerte, não um botão, e nunca aparecem no lugar de uma única página:
onde o salto cobriria só um número, o número é mostrado.

## GlassTable

| Propriedade    | Tipo                        | Padrão      | Descrição                                   |
| -------------- | --------------------------- | ----------- | ------------------------------------------- |
| `columns`      | `GlassTableColumn[]`        | obrigatório | `{ key, label, sortable?, align?, width? }` |
| `rows`         | `Record<string, unknown>[]` | obrigatório | Os dados                                    |
| `rowKey`       | `string \| (row) => string` | índice      | O que identifica uma linha                  |
| `sort`         | `GlassSortState \| null`    | `null`      | Use `v-model:sort` para ordenar você mesmo  |
| `stickyHeader` | `boolean`                   | `false`     | Cabeçalho fixo. Precisa de `maxHeight`      |
| `emptyLabel`   | `string`                    | `'No rows'` | Texto do estado vazio                       |

Eventos: `update:sort` e `row-click`. Slots: `header-[key]`, `cell-[key]` com `{ row, value }` e
`empty`.

Se você passar `sort`, as linhas são renderizadas na ordem recebida e a ordenação é sua. Sem a
propriedade, a tabela ordena sozinha, com `sortFn` se houver.

O contêiner que rola é interno de propósito: o anel especular do vidro sai um pixel da caixa e um
contêiner com rolagem o recortaria.

## GlassDrawer

Irmão do `GlassModal`, encostado numa borda.

| Propriedade  | Tipo                                     | Padrão      | Descrição                                   |
| ------------ | ---------------------------------------- | ----------- | ------------------------------------------- |
| `modelValue` | `boolean`                                | obrigatório | Aberto                                      |
| `side`       | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'`   | Borda em que encosta                        |
| `size`       | `string`                                 | `'20rem'`   | Largura nos lados, altura em cima e embaixo |
| `closeLabel` | `string`                                 | `'Close'`   | Nome acessível do botão de fechar           |

Eventos: `update:modelValue` e `close`. Slots: `header`, padrão e `footer`.

Drawer e modal ficam na mesma camada e empilham por ordem de montagem. O `Escape` sempre pertence ao
que foi aberto por último, e a trava de rolagem conta quem a segura, então fechar o de cima não
devolve a rolagem enquanto o de baixo estiver aberto.

## GlassToast e useToast

A fila vive em escopo de módulo, como o motor de luz. Isso quer dizer que um aviso pode ser disparado
de qualquer lugar, inclusive de fora de um componente, sem provider nenhum.

Monte o ponto de saída uma vez, perto da raiz:

```vue
<GlassToast position="bottom-right" />
```

E dispare de onde precisar:

```ts
import { useToast } from 'glasstora'

const toast = useToast()
toast.show({ message: 'projeto salvo', variant: 'success' })
```

| Propriedade  | Tipo                 | Padrão           | Descrição                                 |
| ------------ | -------------------- | ---------------- | ----------------------------------------- |
| `position`   | `GlassToastPosition` | `'bottom-right'` | Canto em que a fila aparece               |
| `max`        | `number`             | `0`              | Limite de avisos visíveis. `0` não limita |
| `closeLabel` | `string`             | `'Dismiss'`      | Nome acessível do botão de fechar         |

Opções de `show()`: `{ title?, message, variant?, duration?, closable? }`. A duração é em
milissegundos, e `0` mantém o aviso até alguém dispensá-lo. Passar o ponteiro sobre a fila pausa a
contagem de todos e guarda quanto faltava para cada um, em vez de reiniciar.

`useToast()` devolve `{ toasts, show, dismiss, clear }`.

## GlassCommandPalette

| Propriedade      | Tipo             | Padrão         | Descrição                                                |
| ---------------- | ---------------- | -------------- | -------------------------------------------------------- |
| `modelValue`     | `boolean`        | indefinido     | Aberta. Sem ele ela se controla                          |
| `commands`       | `GlassCommand[]` | obrigatório    | `{ id, label, keywords?, shortcut?, group?, disabled? }` |
| `hotkey`         | `string`         | `'mod+k'`      | Atalho que abre. `''` desliga                            |
| `noResultsLabel` | `string`         | `'No results'` | Texto quando nada casa                                   |

Eventos: `update:modelValue` e `select` com o comando.

`mod` é a tecla Meta no Apple e Control no resto. A paleta usa o `GlassModal` por dentro, então herda
o aprisionamento de foco, a trava de rolagem e o vidro do painel. A busca ignora maiúsculas e
acentos, e olha tanto o rótulo quanto as palavras-chave.

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
