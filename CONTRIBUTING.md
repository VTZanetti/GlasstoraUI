# Guia de contribuição

Obrigado pelo interesse em contribuir com o Glasstora.

## Ambiente

O projeto exige Node 20.19 ou superior. A versão usada na integração contínua está no arquivo
`.nvmrc`.

```bash
npm install
npm run dev
```

O comando `dev` sobe a aplicação de demonstração em `http://localhost:5173`, que importa a
biblioteca direto do código fonte.

## Scripts

| Script                 | Função                                  |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Sobe a demo com recarga automática      |
| `npm run build`        | Gera a biblioteca em `dist`             |
| `npm run build:demo`   | Gera a demo em `dist-demo`              |
| `npm run preview:demo` | Serve a demo já compilada               |
| `npm run test`         | Executa a suíte de testes               |
| `npm run typecheck`    | Verifica os tipos com `vue-tsc`         |
| `npm run lint`         | Executa o ESLint                        |
| `npm run format`       | Aplica o Prettier em todo o repositório |

Antes de abrir um pull request, os comandos `lint`, `typecheck`, `test` e `build` precisam passar.

## Idiomas

Para manter o projeto legível tanto para quem lê português quanto para quem chega pelo GitHub:

- Código, comentários, nomes de teste e mensagens de commit em inglês.
- Documentação e textos da demo em português.

## Mensagens de commit

O projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descrição no imperativo>
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Escopos usados no repositório: `styles`, `core`, `components`, `playground`, `docs`, `deps`.

A descrição usa o modo imperativo, começa em letra minúscula e não termina com ponto.

```
feat(components): add loading state to the button
fix(core): release the pointer listener on unmount
docs: document the theming tokens
```

## Estilo de código

O Prettier e o ESLint definem a formatação, e as configurações estão no repositório. Cada
componente segue as mesmas convenções:

- Um único elemento raiz, para que atributos e classes do consumidor sejam repassados.
- Propriedades declaradas com `defineProps` e `withDefaults`, e tipos exportados em `src/types.ts`.
- Escala de tamanhos compartilhada, com os valores `sm`, `md` e `lg`.
- Classes com o prefixo `gt-`, escritas dentro do próprio arquivo do componente.
- Estilos derivados de tokens `--gt-*`, sem valores de cor fixos no componente.

## Estrutura do repositório

```
src/
  components/   componentes públicos
  composables/  composables e detecção de recursos do navegador
  internal/     utilidades privadas, não exportadas no pacote
  styles/       tokens, base e efeitos de vidro
  tests/        testes unitários
playground/     aplicação de demonstração
docs/           documentação de referência
```

## Reportando problemas

Abra uma issue usando um dos modelos disponíveis. Para falhas visuais, informe o navegador, a versão
e, se possível, uma captura de tela.
