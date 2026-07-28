# Tokens de tema

Todo o visual da biblioteca vem de propriedades customizadas com o prefixo `--gt-`, declaradas em
`:root`. Para personalizar o tema, redefina os tokens depois de importar a folha de estilo.

```css
@import 'glasstora/style.css';

:root {
  --gt-blur: 20px;
  --gt-radius-md: 4px;
  --gt-specular-intensity: 0.18;
}
```

Os tokens também podem ser redefinidos em qualquer contêiner, o que limita o efeito à subárvore.

## Escala de cinzas

| Token         | Valor     |
| ------------- | --------- |
| `--gt-gray-0` | `#050505` |
| `--gt-gray-1` | `#0a0a0a` |
| `--gt-gray-2` | `#141414` |
| `--gt-gray-3` | `#1f1f1f` |
| `--gt-gray-4` | `#2e2e2e` |
| `--gt-gray-5` | `#454545` |
| `--gt-gray-6` | `#6b6b6b` |
| `--gt-gray-7` | `#9e9e9e` |
| `--gt-gray-8` | `#cfcfcf` |
| `--gt-gray-9` | `#f5f5f5` |

## Cores semânticas

| Token           | Padrão        | Uso              |
| --------------- | ------------- | ---------------- |
| `--gt-bg`       | `--gt-gray-0` | Fundo da página  |
| `--gt-fg`       | `--gt-gray-9` | Texto principal  |
| `--gt-fg-muted` | `--gt-gray-7` | Texto secundário |
| `--gt-fg-faint` | `--gt-gray-6` | Texto de apoio   |

## Vidro

| Token                    | Padrão        | Uso                                   |
| ------------------------ | ------------- | ------------------------------------- |
| `--gt-glass-tint`        | `255 255 255` | Cor base do vidro, em componentes RGB |
| `--gt-glass-alpha`       | `0.06`        | Opacidade da camada de vidro          |
| `--gt-glass-alpha-hover` | `0.1`         | Opacidade durante a condensação       |
| `--gt-blur`              | `14px`        | Raio do blur                          |
| `--gt-blur-hover`        | `22px`        | Raio do blur durante a condensação    |
| `--gt-border-alpha`      | `0.14`        | Opacidade da borda                    |

## Luz

O provider sobrescreve as posições em tempo real. Os valores padrão criam um brilho fixo quando o
JavaScript não está disponível.

| Token                     | Padrão  | Uso                            |
| ------------------------- | ------- | ------------------------------ |
| `--gt-light-x`            | `50vw`  | Posição horizontal da luz      |
| `--gt-light-y`            | `28vh`  | Posição vertical da luz        |
| `--gt-specular-size`      | `340px` | Raio do brilho central         |
| `--gt-specular-intensity` | `0.12`  | Intensidade do brilho central  |
| `--gt-ring-specular`      | `0.55`  | Intensidade do brilho na borda |

## Textura

| Token                   | Padrão  | Uso                               |
| ----------------------- | ------- | --------------------------------- |
| `--gt-grain`            | SVG     | Imagem de ruído aplicada ao vidro |
| `--gt-grain-opacity`    | `0.05`  | Opacidade do grain                |
| `--gt-scanline-opacity` | `0.045` | Opacidade das linhas horizontais  |

## Raio e elevação

| Token              | Padrão                          |
| ------------------ | ------------------------------- |
| `--gt-radius-sm`   | `6px`                           |
| `--gt-radius-md`   | `10px`                          |
| `--gt-radius-lg`   | `16px`                          |
| `--gt-radius-full` | `999px`                         |
| `--gt-elev-0`      | `none`                          |
| `--gt-elev-1`      | `0 4px 16px rgb(0 0 0 / 0.5)`   |
| `--gt-elev-2`      | `0 8px 32px rgb(0 0 0 / 0.6)`   |
| `--gt-elev-3`      | `0 16px 48px rgb(0 0 0 / 0.72)` |

## Tipografia e movimento

| Token              | Padrão                           |
| ------------------ | -------------------------------- |
| `--gt-font-mono`   | Pilha monoespaçada do sistema    |
| `--gt-text-sm`     | `12px`                           |
| `--gt-text-md`     | `14px`                           |
| `--gt-text-lg`     | `16px`                           |
| `--gt-ease`        | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--gt-dur-1`       | `120ms`                          |
| `--gt-dur-2`       | `240ms`                          |
| `--gt-caret-blink` | `1s`                             |

## Atributos de controle

O `GlassProvider` escreve estes atributos no elemento `html`, e o CSS reage a eles.

| Atributo                 | Efeito                                              |
| ------------------------ | --------------------------------------------------- |
| `data-gt-refract`        | Ativa o filtro de refração                          |
| `data-gt-grain="off"`    | Desliga o grain                                     |
| `data-gt-sheen="static"` | Troca o brilho dinâmico por um reflexo fixo, no iOS |
