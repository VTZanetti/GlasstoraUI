# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.2.0]

O tema desta versão é a coerência dos reflexos entre os componentes, e a abertura da biblioteca para
que o consumidor componha as próprias superfícies de vidro. Nada da API 0.1.0 mudou de nome ou de
comportamento.

### Adicionado

- Motor de luz com geometria por elemento. Um registro central mede cada superfície e escreve nela
  cinco propriedades customizadas: `--gt-light-u`, `--gt-light-v`, `--gt-light-angle`,
  `--gt-light-energy` e `--gt-light-incidence`. O laço de animação é único na página, roda em três
  fases (medir tudo, calcular tudo, escrever tudo) e para sozinho quando nada se move.
- Luz direcional na borda. O anel especular ganhou duas camadas além do brilho pontual: a borda
  voltada para a luz clareia e a oposta escurece. Até a 0.1.0 todas as bordas eram iguais.
- Composable `useGlassSurface`, que transforma qualquer elemento em superfície de vidro registrada no
  motor de luz.
- Diretiva `v-glass`, com modificadores `interactive`, `volatile`, `flat`, `no-light`, `no-ring` e
  `no-grain`, e com `getSSRProps` para não divergir na hidratação.
- Plugin de instalação em `glasstora/plugin`, com opções de prefixo, seleção de componentes,
  diretiva e ajuste do motor de luz.
- Resolver para `unplugin-vue-components` em `glasstora/resolver`, e tipos globais opcionais em
  `glasstora/global`.
- Composable `useGlassConfig`, que era a metade que faltava do `configKey`.
- Onze componentes: `GlassCard`, `GlassDivider`, `GlassField`, `GlassTextarea`, `GlassCheckbox`,
  `GlassAvatar`, `GlassSpinner`, `GlassSkeleton`, `GlassAlert`, `GlassTooltip` e `GlassPopover`.
- Camada flutuante própria, sem dependência de runtime, usada pelo tooltip e pelo popover. Ela se
  inverte quando não cabe, desliza para não vazar da janela e some quando a âncora sai de um
  contêiner com rolagem.
- Tema claro, ativado por `data-gt-theme="light"` ou pela propriedade `theme` do `GlassProvider`.
  Sobre fundo claro a direção da luz é lida por sombreamento, não por realce. O seletor de tema fica
  no cartão do `GlassProvider` na demonstração, junto de `refraction` e `grain`, e vale para a
  página inteira.
- Propriedades `theme`, `lightFalloff`, `lightHeight` e `lightGain` no `GlassProvider`, e a função
  `configureLight` para o mesmo ajuste fora dele.
- Propriedade `closable` no `GlassModal` e propriedades de formulário (`id`, `name`, `autocomplete`,
  `readonly`, `required`) no `GlassInput`.
- Seção "inspetor de luz" na demonstração, com as superfícies dentro de cada contexto que quebrava o
  reflexo na 0.1.0, leitura numérica ao vivo e um modo de estresse com sessenta superfícies.

### Corrigido

- O modo `ascii` do `GlassProgress` ignorava `indeterminate` por completo e desenhava a barra pelo
  valor. Agora uma faixa graduada percorre a trilha, usando os blocos parciais `░▒▓█`: com apenas
  cheio e vazio cada célula tem dois estados e a barra pisca em vez de andar. A faixa dá a volta na
  trilha, então não existe intervalo em que ela apareça vazia.
- O percentual visível continuava sendo exibido com `indeterminate` ligado, nos dois modos, apesar de
  o `aria-valuenow` já ser corretamente omitido.
- A demonstração mostrava a versão escrita à mão, parada na 0.1.0. Passou a ler a constante `VERSION`
  da própria biblioteca, e a configuração de build da demo define a versão do manifesto, como a
  configuração da biblioteca já fazia.
- O reflexo saía do lugar dentro de qualquer ancestral com `transform`, `filter`, `backdrop-filter`,
  `will-change`, `contain` ou `perspective`, porque era posicionado com `background-attachment:
  fixed` em coordenadas de janela e essas propriedades criam bloco contentor. O painel do
  `GlassModal`, que anima em `transform`, era o caso mais visível.
- O iOS não tinha coerência de luz nenhuma, porque o Safari daquela plataforma ignora fundos fixos e
  a biblioteca caía num degradê diagonal parado.
- O raio do brilho no anel estava fixo em 200px enquanto o do corpo usava `--gt-specular-size`, então
  os dois nunca concordavam. Agora o anel deriva do mesmo token, por `--gt-ring-size`.
- `GlassKbd` e `GlassBadge` não participavam do sistema de luz e usavam opacidades escritas à mão.
- Com dois `GlassProvider` na página, desmontar o primeiro removia o filtro de refração dos demais.
  Em renderização no servidor, a mesma checagem marcava todos os providers como o primeiro, o que era
  uma divergência de hidratação esperando para acontecer.
- O `configKey` era fornecido com valores desestruturados, portanto não reativos, e não havia forma
  de consumi-lo.
- O `GlassModal` sem título e sem slot de cabeçalho não tinha botão de fechar.
- O `GlassTerminal` ignorava mudanças em `lines` depois da montagem.
- O indicador de carregamento do `GlassButton` e o cursor piscante ignoravam
  `prefers-reduced-motion`.
- O atributo `data-gt-sheen` era escrito mas nunca removido quando a detecção deixava de valer.
- A constante `VERSION` estava escrita à mão em `src/index.ts`, fora de sincronia com o manifesto.
- A CI fixava a versão do Node em vez de ler o `.nvmrc`, que era a terceira fonte divergente junto
  com `engines` e o guia de contribuição.

### Alterado

- Toda a folha de estilo passou a viver dentro de `@layer glasstora`. Qualquer regra do consumidor
  que não esteja em uma camada agora vence a biblioteca sem disputa de especificidade. Dentro da
  camada, a ordem das declarações `!important` se inverte, então os blocos de
  `prefers-reduced-transparency` ficaram mais fortes, não mais fracos.
- Filetes, preenchimentos e o anel de foco passaram a ler `--gt-line-tint` mais um alfa nomeado, em
  vez de repetirem `rgb(255 255 255 / ...)` em cada componente. É o que permite o tema claro virar
  todos eles de uma vez.
- O `GlassSurface` aceita `'none'` e `'full'` em `radius`, além da escala de tamanhos.
- O `GlassProvider` não roda mais um laço de animação próprio. Ele publica a posição e o registro
  distribui, então existe um só na página.
- O pacote passou a expor os subcaminhos `./plugin`, `./resolver`, `./global` e `./package.json`.
- A demonstração passou a ler os tokens da biblioteca em vez de repetir os cinzas em cada arquivo,
  então a página inteira acompanha o tema. Antes o cenário estava preso à paleta escura, e um tema
  claro deixaria painéis brancos sobre uma página quase preta.
- Cada bloco da demonstração mostra uma única instância do componente, dirigida pelos controles, no
  lugar das galerias que exibiam várias variantes ao mesmo tempo.
- O `GlassModal` passou a fechar pelo mesmo `useDismissable` que o `GlassPopover` usa, em vez de
  manter uma cópia própria da mesma lógica de Esc e clique fora.
- O contador que move as animações em texto virou um utilitário compartilhado. O `GlassSpinner` e a
  barra `ascii` tinham cada um a própria cópia do intervalo e da observação de
  `prefers-reduced-motion`.

## [0.1.0]

Primeira versão da biblioteca: dez componentes sobre uma receita de vidro única e uma fonte de luz
global, com a demonstração no ar.

### Adicionado

- Sistema de tokens monocromáticos com prefixo `--gt-`, cobrindo cores, vidro, elevação, raio,
  tipografia e movimento.
- Receita `.gt-glass` em três camadas, com refração por filtro SVG em navegadores Chromium, blur nos
  demais e superfície sólida como último recurso.
- Motor de luz global no `GlassProvider`, com um único listener de ponteiro, modo de deriva em telas
  sensíveis ao toque e modo estático quando o usuário pede menos movimento.
- Composable `useGlassLight` para leitura e controle da posição da luz.
- Dez componentes: `GlassProvider`, `GlassSurface`, `GlassButton`, `GlassInput`, `GlassSwitch`,
  `GlassKbd`, `GlassBadge`, `GlassProgress`, `GlassModal` e `GlassTerminal`.
- Suporte a `prefers-reduced-motion` e `prefers-reduced-transparency`.
- Propriedades reativas no `GlassProvider`, então `refraction`, `grain` e `trackPointer` podem
  mudar depois da montagem.
- Propriedade `closeLabel` no `GlassModal`, com padrão em inglês, para traduzir o nome acessível do
  botão de fechar.
- Página de demonstração com navegação lateral, controles de propriedade em tempo real e exemplos
  de código copiáveis para cada componente, publicada no Netlify.

[não lançado]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/VTZanetti/GlasstoraUI/releases/tag/v0.1.0
