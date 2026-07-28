# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.1.0]

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
- Aplicação de demonstração publicada no GitHub Pages.

[não lançado]: https://github.com/VTZanetti/GlasstoraUI/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/VTZanetti/GlasstoraUI/releases/tag/v0.1.0
