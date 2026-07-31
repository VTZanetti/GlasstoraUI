# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.3.0]

O tema desta versão é fechar o catálogo de interface e levar a biblioteca ao npm com um custo de
estilo proporcional ao uso: quem importa três componentes passa a carregar a base e três folhas, e
não as trinta e seis. O catálogo vai de vinte e um para trinta e seis componentes. Nada da API 0.2.0
mudou de nome ou de comportamento.

### Adicionado

- Quinze componentes: `GlassRadio` e `GlassRadioGroup`, `GlassSlider`, `GlassSelect`,
  `GlassCombobox`, `GlassMenu`, `GlassTabs` e `GlassTabPanel`, `GlassAccordion`, `GlassBreadcrumb`,
  `GlassPagination`, `GlassTable`, `GlassDrawer`, `GlassToast` e `GlassCommandPalette`.
- Composable `useToast()`, a única primitiva pública nova. A fila vive em escopo de módulo, como o
  registro de luz, então um aviso pode ser disparado de qualquer lugar, inclusive de fora de um
  componente. O `GlassToast` é o ponto de saída que a aplicação monta uma vez.
- Folha de estilo por componente em `glasstora/css/`, com a base compartilhada em
  `glasstora/css/base.css`. O resolver de `unplugin-vue-components` passa a importar apenas o que a
  página renderiza; a opção `css: 'bundle'` restaura o comportamento da 0.2.0 para quem precisar.
- Publicação automatizada no npm. Empurrar uma tag `v*` dispara o fluxo de release, que repete as
  verificações da integração contínua, confere a tag contra o manifesto e publica com proveniência.
- Verificação do pacote construído (`npm run check:dist`), que roda na integração contínua e antes
  de publicar. Ela cobre a dívida que estava registrada desde a 0.2.0: nenhuma regra `.gt-` pode
  ficar fora da camada `glasstora`. Também confere que todo componente tem folha de estilo, que a
  divisão e o arquivo único dizem a mesma coisa, e que todo caminho citado pelo resolver existe.
- Três primitivas internas que os componentes novos compartilham: `useControllable`, para um valor
  que funciona com e sem `v-model`; `useRovingTabIndex`, com orientação, laço, ativação manual ou
  automática, modo `aria-activedescendant` e busca por digitação; e `scrollLock`, extraído do
  `GlassModal`.

### Corrigido

- Escape e clique fora agora pertencem à camada mais alta. Cada camada escutava o documento por
  conta própria e todas respondiam juntas, então um menu aberto dentro de um modal derrubava o
  modal. Pior: o painel do menu é teleportado e portanto fica fora do painel do modal, de modo que
  clicar num item do menu era lido como clique fora do modal.
- A trava de rolagem passou a contar quem a segura. Duas camadas abertas ao mesmo tempo faziam a
  segunda gravar `overflow: hidden` como o valor a restaurar, e a página nunca voltava a rolar.
- O `max` do `GlassToast` derruba os avisos excedentes em vez de apenas escondê-los. Eles ficavam na
  fila com o temporizador correndo atrás do limite, e uma rajada de notificações voltava a aparecer
  minutos depois, conforme os visíveis expiravam e descobriam o acúmulo.
- Cada item do `GlassToast` deixou de se registrar de novo no motor de luz a cada quadro. A função
  de `ref` era escrita direto no template, portanto era outra a cada renderização, e o Vue lê uma
  `ref` trocada como o elemento saindo: a lista inteira soltava e registrava todas as superfícies a
  cada patch, justo quando havia menos folga.

### Alterado

- **Incompatível: `speed` do `GlassSpinner` agora é quadros por segundo, e não mais milissegundos
  por quadro.** Aumentar o número acelera o giro, que é o que o nome promete; antes fazia o
  contrário. O padrão passou de `80` para `12`, que é a mesma velocidade, então quem não toca na
  propriedade não vê diferença. Quem passava um valor precisa convertê-lo: o equivalente de `80` é
  `12`, e a conta é `1000 / milissegundos`. Deixado como está, um `:speed="80"` vindo da 0.2.0 pede
  12,5 ms por quadro e esbarra no piso de 16 ms do ticker, girando cinco vezes mais rápido em vez de
  mais devagar.
- O `GlassProgress` ganhou os modos `blocks` e `dots`, a mesma leitura célula a célula do `ascii`
  desenhada em vez de escrita. Os três compartilham a varredura do estado indeterminado.
- O cabeçalho fixo do `GlassTable` ficou opaco. Um `backdrop-filter` não desfoca o que rola sob um
  irmão fixo no mesmo contêiner, então as linhas passavam legíveis por baixo dos nomes das colunas.
- O `GlassTabs` quebra linha em vez de rolar, e o painel do `GlassMenu` não tem mais altura máxima.
  Uma lista que rola esconde itens atrás de uma borda sem nada que diga que eles existem, e as setas
  do roving levavam a seleção para fora da tela.
- As listas do `GlassSelect` e do `GlassCombobox` só rolam na vertical; um rótulo comprido é cortado
  com reticências em vez de criar uma barra horizontal.
- O painel do `GlassSelect` e do `GlassCombobox` abre desenrolando a partir da borda encostada no
  gatilho. Antes a transição animava `transform`, que é a propriedade que o posicionador reescreve a
  cada quadro, então o painel saltava para o canto da janela durante a animação.
- O estilo de cada componente passou a viver num arquivo `.css` irmão do `.vue`, referenciado por
  `<style src>`. É o que torna a divisão possível; o resultado visual e o `dist/style.css` são os
  mesmos byte a byte.
- A folha base abre declarando `@layer glasstora`, para que a posição da camada na cascata venha
  dela e não de qualquer folha de componente que o empacotador resolva emitir primeiro.

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

[não lançado]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/VTZanetti/GlasstoraUI/releases/tag/v0.1.0
